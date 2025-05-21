// server.js (secured version with JWT middleware)
const express = require('express');
const sql = require('mssql');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = 'secret';
const submittedApplications = [];
const pendingApplications = [];
const users = [];
const fetch = require('node-fetch');
const app = express();
const port = 3000;
const fs = require('fs');

//Image related
//const multer = require('multer');
//const upload = multer({ storage: multer.memoryStorage() });


app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// const express = require('express');
// const sql = require('mssql');
// const path = require('path');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const app = express();
// const port = 3000;
// const secretKey = 'secret';

// const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: Authenticate JWT Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).send({ success: false, message: 'Token missing' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(403).send({ success: false, message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
}

// Middleware: Authorize by Role
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        const role = req.user.role?.toLowerCase();
        if (!allowedRoles.includes(role)) {
            return res.status(403).send({ success: false, message: 'Access denied' });
        }
        next();
    };
}

const connection2 = {
    user: 'adminn',
    password: 'admin12345!',
    server: "event-hive-database.database.windows.net",
    database: 'EventHive',
    options: {
        encrypt: true,
        enableArithAbort: false
    }
};

sql.connect(connection2)
    .then(() => console.log('Connected to SQL Server database'))
    .catch(err => console.error('Database connection error:', err));

app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home_page.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Users WHERE Email = '${email}' AND Password = '${password}'`);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            const token = jwt.sign({ id: user.Id, email: user.Email, role: user.Role }, secretKey, { expiresIn: '1h' });
            let redirectTo = 'home_page.html';
            const role = user.Role?.toLowerCase();
            if (role === 'admin') redirectTo = 'admin_events.html';
            else if (role === 'organizer') redirectTo = 'organiser_create.html';
            else if (role === 'client') redirectTo = 'client_home_page.html';

            const existingUser = users.find(u => u.email === email);
            if (!existingUser) {
                users.push({ email: user.Email, role: user.Role });
            }

            res.send({ success: true, token, redirectTo });
        } else {
            res.send({ success: false });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send({ success: false });
    }
});


app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, age } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`INSERT INTO Users (FirstName, LastName, Email, Password, Age) VALUES ('${firstName}', '${lastName}', '${email}', '${password}', ${age})`);
        res.send({ success: true });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).send({ success: false });
    }
});

app.delete('/delete-user', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { email } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`DELETE FROM Users WHERE Email = '${email}'`);
        res.send({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).send({ success: false });
    }
});

app.get('/admin-events', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Event`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching admin events:', err);
        res.status(500).send({ success: false });
    }
});

app.get('/organiser-events', authenticateToken, authorizeRoles('organizer'), async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Event WHERE OrganizerEmail = '${req.user.email}'`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching organizer events:', err);
        res.status(500).send({ success: false });
    }
});


app.post('/approve-event', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { eventId } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`UPDATE Event SET status = 'active' WHERE EventID = ${eventId}`);
        res.send({ success: true });
    } catch (err) {
        console.error('Error approving event:', err);
        res.status(500).send({ success: false });
    }
});

// Get event details by name
app.post('/update-event-status', async (req, res) => {
    const { name, status } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`
            UPDATE Event SET status = '${status}'
            WHERE name = '${name}'
        `);
        res.send({ success: true });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).send({ success: false });
    }
});

app.delete('/delete-event', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { eventId } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`DELETE FROM Event WHERE EventID = ${eventId}`);
        res.send({ success: true });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).send({ success: false });
    }
});

app.post('/update-role', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { email, role } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`UPDATE Users SET Role = '${role}' WHERE Email = '${email}'`);
        res.send({ success: true });
    } catch (err) {
        console.error('Update role error:', err);
        res.status(500).send({ success: false });
    }
});

app.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Users`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send({ success: false });
    }
});

app.get('/events', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT EventID, name, nr_of_tickets, date, time, address, status, age_requirement, artist, theme FROM Event WHERE status = 'active' ORDER BY date ASC, time ASC`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send({ success: false });
    }
});

// Get event details by name
app.post('/create-event', authenticateToken, authorizeRoles('organizer'), async (req, res) => {
    const { name, address, date, time, artist, age_requirement, theme, nr_of_tickets } = req.body;

    try {
        const userEmail = req.user.email;
        const request = new sql.Request();
        const userRes = await request.query(`SELECT Id FROM Users WHERE Email = '${userEmail}'`);
        if (userRes.recordset.length === 0)
            return res.status(404).send({ success: false, message: 'Organizer not found' });

        await request.query(`
            INSERT INTO Event (
                name, address, date, time, artist,
                age_requirement, theme, nr_of_tickets,
                OrganizerEmail, status
            ) VALUES (
                '${name}', '${address}', '${date}', '${time}', '${artist}',
                '${age_requirement}', '${theme}', ${nr_of_tickets},
                '${userEmail}', 'pending'
            )
        `);

        res.send({ success: true });
    } catch (err) {
        console.error('Event creation failed:', err);
        res.status(500).send({ success: false, message: 'Event creation failed' });
    }
});


app.delete('/delete-account', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const request = new sql.Request();
        await request.query(`DELETE FROM Users WHERE Email = '${userEmail}'`);
        res.send({ success: true });
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).send({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

app.post('/submit-application', authenticateToken, authorizeRoles('client', 'user'), async (req, res) => {
    const { name, email, phone, organization, experience, whyJoin } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`
            INSERT INTO Applications (Name, Email, Phone, Organization, Experience, WhyJoin)
            VALUES ('${name}', '${email}', '${phone}', '${organization}', '${experience}', '${whyJoin}')
        `);
        res.send({ success: true });
    } catch (err) {
        console.error('Error submitting application:', err);
        res.status(500).send({ success: false });
    }
});


app.get('/my-applications', authenticateToken, authorizeRoles('client', 'user'), async (req, res) => {
    const userEmail = req.user.email;
    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT Id, Email, Phone, Organization, Experience, WhyJoin, Status 
            FROM Applications 
            WHERE Email = '${userEmail}'
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).send({ success: false });
    }
});




app.get('/admin-applications', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Applications WHERE Status = 'pending'`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching applications:', err);
        res.status(500).send({ success: false });
    }
});



app.post('/respond-application', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    const { Id, Email, decision } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            UPDATE Applications 
            SET Status = '${decision}' 
            WHERE Id = ${Id} AND Email = '${Email}'
        `);

        if (decision === 'approved') {
            await request.query(`
                UPDATE Users 
                SET Role = 'Organizer' 
                WHERE Email = '${Email}'
            `);
        }

        res.send({ success: true });
    } catch (err) {
        console.error('Error updating application:', err);
        res.status(500).send({ success: false, message: 'Database update failed' });
    }
});

app.get('/my-events', authenticateToken, authorizeRoles('organizer'), async (req, res) => {
    const email = req.user.email;
    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT * FROM Event
            WHERE OrganizerEmail = '${email}'
            ORDER BY date ASC, time ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching organizer events:', err);
        res.status(500).send({ success: false });
    }
});

app.post('/book-tickets', authenticateToken, async (req, res) => {
    try {
        const { tickets } = req.body;

        for (const ticket of tickets) {
            const { ticketType, ClientEmail, NrOfTickets, EventName } = ticket;

            console.log('Inserting ticket:', ticket);

            const request = new sql.Request();

            await request
              .input('ticketType', sql.VarChar, ticketType)
              .input('ClientEmail', sql.VarChar, ClientEmail)
              .input('NrOfTickets', sql.Int, NrOfTickets)
              .input('EventName', sql.VarChar, EventName)
              .query(`
                  INSERT INTO Ticket (ticketType, ClientEmail, NrOfTickets, EventName)
                  VALUES (@ticketType, @ClientEmail, @NrOfTickets, @EventName)
              `);
        }

        res.send({ success: true });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).send({ success: false, message: 'Booking failed internally' });
    }
});

app.get('/my-tickets', authenticateToken, async (req, res) => {
    try {
        const email = req.user.email;
        const request = new sql.Request();
        const result = await request.query(`
            SELECT EventName, ticketType, NrOfTickets
            FROM Ticket
            WHERE ClientEmail = '${email}'
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching tickets:', err);
        res.status(500).send({ success: false, message: 'Failed to load tickets' });
    }
});

app.get('/my-account-info', authenticateToken, async (req, res) => {
    try {
        const request = new sql.Request();
        const email = req.user.email;

        const result = await request.query(`SELECT FirstName, LastName, Email, Age FROM Users WHERE Email = '${email}'`);
        if (result.recordset.length === 0) return res.status(404).send({ success: false });

        res.send({ success: true, user: result.recordset[0] });
    } catch (err) {
        console.error('Error fetching account info:', err);
        res.status(500).send({ success: false });
    }
});

app.post('/update-account', authenticateToken, async (req, res) => {
    try {
        const email = req.user.email;
        const fields = req.body;

        const updates = Object.entries(fields).map(([key, value]) =>
            `${key} = '${value}'`).join(', ');

        if (!updates) return res.status(400).send({ success: false, message: 'No fields to update' });

        const request = new sql.Request();
        await request.query(`UPDATE Users SET ${updates} WHERE Email = '${email}'`);
        res.send({ success: true });
    } catch (err) {
        console.error('Error updating account:', err);
        res.status(500).send({ success: false, message: 'Internal update error' });
    }
});



app.post('/update-account', authenticateToken, async (req, res) => {
    const email = req.user.email;
    console.log('Incoming update body:', req.body);

    const { firstName, lastName, age, password } = req.body;

    try {
        const updates = [];
        const request = new sql.Request();

        if (firstName) {
            updates.push("FirstName = @FirstName");
            request.input('FirstName', sql.VarChar, firstName);
        }
        if (lastName) {
            updates.push("LastName = @lastName");
            request.input('lastName', sql.VarChar, lastName);
        }
        if (age) {
            updates.push("Age = @age");
            request.input('age', sql.Int, age);
        }
        if (password) {
            updates.push("Password = @password");
            request.input('password', sql.VarChar, password);
        }

        if (updates.length === 0) {
            return res.status(400).send({ success: false, message: 'No valid fields provided for update' });
        }

        request.input('email', sql.VarChar, email);
        const query = `UPDATE Users SET ${updates.join(', ')} WHERE Email = @email`;

        await request.query(query);
        res.send({ success: true });
    } catch (err) {
        console.error('Error updating account:', err);
        res.status(500).send({ success: false, message: 'Database update failed' });
    }
});
