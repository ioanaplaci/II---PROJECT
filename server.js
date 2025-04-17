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
  

//login button
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

            //create JWT token
            const token = jwt.sign(
                { id: user.Id, email: user.Email },
                secretKey,
                { expiresIn: '1h' }
            );

            //check if admin
            const isAdmin = user.Email =='sava.mihnea78@gmail.com' && user.Password === 'd%m*A3ahl59EgYk&';

            res.send({
                success: true,
                token,
                redirectTo: isAdmin ? 'admin_events.html' : 'home_page.html'
            });
        } else {
            res.send({ success: false });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send({ success: false });
    }
});

//register button
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

//this starts your Express app
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

