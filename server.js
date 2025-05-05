const express = require('express');
const sql = require('mssql');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretKey = 'secret';

const app = express();
const port = 3000;

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
    .then(pool => {
        console.log('Connected to SQL Server database');
    })
    .catch(err => {
        console.error('Error connecting to SQL Server database:', err);
    });

//middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

//initial page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home_page.html'));
  });
  

//login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT * FROM Users 
            WHERE Email = '${email}' AND Password = '${password}'
        `);

        if (result.recordset.length > 0) {
            const user = result.recordset[0];

            // create JWT token
            const token = jwt.sign(
                { id: user.Id, email: user.Email },
                secretKey,
                { expiresIn: '1h' }
            );

            // Determine redirect based on role
            let redirectTo = 'home_page.html'; // default fallback
            const role = user.Role?.toLowerCase(); // just in case it's null

            // Page directing by role
            if (role === 'admin') {
                redirectTo = 'admin_events.html';
            } else if (role === 'organizer') {
                redirectTo = 'organiser_create.html';
            } else if (role === 'client') {
                redirectTo = 'client_home_page.html';
            }

            res.send({
                success: true,
                token,
                redirectTo
            });
        } else {
            res.send({ success: false });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send({ success: false });
    }
});


//register
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, age } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            INSERT INTO Users (FirstName, LastName, Email, Password, Age)
            VALUES ('${firstName}', '${lastName}', '${email}', '${password}', ${age})
        `);

        res.send({ success: true });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).send({ success: false });
    }
});

// Delete users from admin page
app.delete('/delete-user', async (req, res) => {
    const { email } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            DELETE FROM Users
            WHERE Email = '${email}'
        `);
        res.send({ success: true });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).send({ success: false });
    }
});


// Book tickets route
app.post('/book-tickets', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        const decoded = jwt.verify(token, secretKey);
        const { email } = decoded;
        const { eventName, generalQty, vipQty } = req.body;

        const request = new sql.Request();

        // Get User ID
        const userResult = await request.query(`
            SELECT Id FROM Users WHERE Email = '${email}'
        `);
        if (userResult.recordset.length === 0) {
            return res.status(401).send({ success: false, message: 'User not found' });
        }
        const userId = userResult.recordset[0].Id;

        // Get Event ID
        const eventResult = await request.query(`
            SELECT EventID FROM Events WHERE name = '${eventName}'
        `);
        if (eventResult.recordset.length === 0) {
            return res.status(400).send({ success: false, message: 'Event not found' });
        }
        const eventId = eventResult.recordset[0].EventID;

        // Save ticket booking
        await request.query(`
            INSERT INTO Ticket (UserID, EventID, GeneralQty, VIPQty)
            VALUES (${userId}, ${eventId}, ${generalQty}, ${vipQty})
        `);

        res.send({ success: true });
    } catch (err) {
        console.error('Booking error:', err);
        res.status(500).send({ success: false });
    }
});

///Events management for admin page
// Get events with status
app.get('/admin-events', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Event`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching admin events:', err);
        res.status(500).send({ success: false });
    }
});

// Approve event (change status to 'active')
app.post('/approve-event', async (req, res) => {
    const { eventId } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            UPDATE Event SET status = 'active' WHERE EventID = ${eventId}
        `);
        res.send({ success: true });
    } catch (err) {
        console.error('Error approving event:', err);
        res.status(500).send({ success: false });
    }
});

// Delete event
app.delete('/delete-event', async (req, res) => {
    const { eventId } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            DELETE FROM Event WHERE EventID = ${eventId}
        `);
        res.send({ success: true });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).send({ success: false });
    }
});


// Update user role
app.post('/update-role', async (req, res) => {
    const { email, role } = req.body;

    try {
        const request = new sql.Request();
        await request.query(`
            UPDATE Users
            SET Role = '${role}'
            WHERE Email = '${email}'
        `);
        res.send({ success: true });
    } catch (err) {
        console.error('Update role error:', err);
        res.status(500).send({ success: false });
    }
});


// get all users for admin dashboard
app.get('/users', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM Users`);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send({ success: false });
    }
});


// Get all events
// Used by client_home_page.html and home_page.html
app.get('/events', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT name, nr_of_tickets, date, time, address, status, age_requirement, artist, theme, picture_url
            FROM Event
            WHERE status = 'active'
            ORDER BY date ASC, time ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send({ success: false });
    }
});




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

// Delete event by EventID
app.delete('/delete-event', async (req, res) => {
    const { eventId } = req.body;
    try {
        const request = new sql.Request();
        await request.query(`
            DELETE FROM Event WHERE EventID = ${eventId}
        `);
        res.send({ success: true });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).send({ success: false });
    }
});














//this starts your Express app
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});