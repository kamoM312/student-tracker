    import express from 'express';
    import dbPool from './db.js'; // Import the connection pool
    import bodyParser from 'body-parser';

    const app = express();
    const port = 3000;

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({ extended: true }));

//     app.use((req, res, next) => {
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   next();
// });

    // Get all users
    app.get('/users', async (req, res) => {
        try {
            const [rows] = await dbPool.query('SELECT * FROM students;');
            res.json(rows);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).send('Error fetching users');
        }
    });

    // Get user by ID 
    app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        try {
            const [rows] = await dbPool.query(`SELECT * FROM students WHERE id=${id};`);
            res.json(rows);
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).send('Error fetching user');
        }
    });

    // Create new user 
    app.post(`/create`, async (req, res) => {
        console.log(req.body)
        const name = req.body.name;
        const email = req.body.email;
        console.log(name);
        console.log(email);
        try {
            await dbPool.query(`INSERT INTO students (name, email) VALUES ('${name}', '${email}')`
            );
            res.json("success");
        } catch (error) {
            console.error('Error creating user:', error);
            res.status(500).send('Error creating user');
        }
    });

    // Update user 
    app.post('/update', async (req, res) => {
        
        const id = req.body.id;
        const formName = req.body.name;
        const formEmail = req.body.email;
        // Get existing user details 
         try {
            const student = await dbPool.query(`SELECT * FROM students WHERE id=${id};`
            );
            // console.log(student[0]);
            const name = student[0][0].name;
            const email = student[0][0].email;

            const sName = formName || `${name}`;
            const sEmail = formEmail || `${email}`;

            // Update user details 
            try {
            await dbPool.query(`UPDATE students SET name='${sName}', email='${sEmail}' WHERE id='${id}';`);
            res.json("Sucess");
        } catch (error) {
            console.error('Error updating user field(s):', error);
            res.status(500).send('Error updating user field(s)');
        }
        } catch (error) {
            console.error('User does not exist:', error);
            res.status(500).send('User does not exist');
        }
    });

    // Delete user 
     app.post('/delete', async (req, res) => {
        const id = req.body.id;
        console.log(id)
        // Error deleting user 
        try {
            await dbPool.query(`DELETE FROM students WHERE id='${id}';`);
            res.json("Sucess");
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).send('Error deleting users');
        }
    });

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });