const sql = require('mssql');
const fetch = require('node-fetch');

// Your SQL Server config
const config = {
    user: 'adminn',
    password: 'admin12345!',
    server: 'event-hive-database.database.windows.net',
    database: 'EventHive',
    options: {
        encrypt: true,
        enableArithAbort: false
    }
};

// Convert image URL to base64
async function imageUrlToBase64(url) {
    const response = await fetch(url);
    const buffer = await response.buffer();
    return buffer.toString('base64');
}

// Main logic
async function convertImagesToBase64() {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const result = await request.query('SELECT EventID, picture_url FROM Event WHERE picture_url IS NOT NULL');

        for (const row of result.recordset) {
            const { EventID, picture_url } = row;
            console.log(`Converting image for EventID ${EventID}...`);

            try {
                const base64 = await imageUrlToBase64(picture_url);
                
                // OPTIONAL: update in DB (if you create a `picture_base64` column)
                await request.query(`
                    UPDATE Event
                    SET picture_url = 'data:image/jpeg;base64,${base64}'
                    WHERE EventID = ${EventID}
                `);

                console.log(`✅ Updated EventID ${EventID} with base64 image.`);
            } catch (imgErr) {
                console.error(`❌ Failed to convert image for EventID ${EventID}:`, imgErr.message);
            }
        }

        await sql.close();
    } catch (err) {
        console.error('Error connecting to DB or processing:', err);
    }
}

convertImagesToBase64();
