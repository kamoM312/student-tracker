    import express from 'express';
    import dbPool from './db.js'; // Import the connection pool
    import bodyParser from 'body-parser';
    import { v4 as uuidv4, parse as uuidParse } from 'uuid';

    const app = express();
    const port = 3000;

    app.use(bodyParser.json());

    app.use(bodyParser.urlencoded({ extended: true }));

//     app.use((req, res, next) => {
//   console.log('Headers:', req.headers);
//   console.log('Body:', req.body);
//   next();
// });

// const uuid = uuidv4(); // string
// const uuidBuffer = Buffer.from(uuidParse(uuid)); // binary(16)

// dbPool.query(
//   'UPDATE students SET uid = ? WHERE uid IS NULL',
//   [uuidBuffer],
//   (err, results) => {
//     if (err) throw err;
//     console.log('Updated rows:', results.affectedRows);
//   }
// );

(async () => {
  try {
    const [rows] = await dbPool.query('SELECT id FROM students WHERE uid IS NULL');

    for (const row of rows) {
      const newUuid = uuidv4(); // create a unique UUID
      const uuidBuffer = Buffer.from(uuidParse(newUuid)); // convert to binary(16)

      await dbPool.query(
        'UPDATE students SET uid = ? WHERE id = ?',
        [uuidBuffer, row.id]
      );
    }

    console.log(`Updated ${rows.length} students with new UUIDs.`);
  } catch (err) {
    console.error('Error updating UUIDs:', err);
  }
})();
    

    // Get all users
    // app.get('/users', async (req, res) => {
    //     try {
    //         const [rows] = await dbPool.query('SELECT * FROM students;');
    //         res.json(rows);
    //     } catch (error) {
    //         console.error('Error fetching users:', error);
    //         res.status(500).send('Error fetching users');
    //     }
    // });

    app.get('/users', async (req, res) => {
    try {
        const [rows] = await dbPool.query(
            'SELECT BIN_TO_UUID(uid) AS uid, id, name, email, phone, date_of_birth FROM students;'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Error fetching users');
    }
});

    // Get user by ID 
    // app.get('/users/:id', async (req, res) => {
    //     const id = req.params.id;
    //     try {
    //         const [rows] = await dbPool.query(`SELECT * FROM students WHERE id=${id};`);
    //         res.json(rows);
    //     } catch (error) {
    //         console.error('Error fetching user:', error);
    //         res.status(500).send('Error fetching user');
    //     }
    // });

    app.get('/users/:uid', async (req, res) => {
    const uid = req.params.uid;
    try {
        const [rows] = await dbPool.query(
            'SELECT BIN_TO_UUID(uid) AS uid, id, name, email, phone, date_of_birth FROM students WHERE uid = UUID_TO_BIN(?)',
            [uid]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Error fetching user');
    }
});


    // Create new user 
    // app.post(`/create`, async (req, res) => {
    //     console.log(req.body.data)
    //     const name = req.body.data.name;
    //     const email = req.body.data.email;
    //     const phone = req.body.data.phone;
    //     const date = req.body.data.date_of_birth;

    //     try {
    //         await dbPool.query(`INSERT INTO students (name, email, phone, date_of_birth) VALUES ('${name}', '${email}', '${phone}', '${date}');`
    //         );
    //         res.json("success");
    //     } catch (error) {
    //         console.error('Error creating user:', error);
    //         res.status(500).send('Error creating user');
    //     }
    // });

    app.post('/create', async (req, res) => {
    const { name, email, phone, date_of_birth: date } = req.body.data;

    try {
        const newUuid = uuidv4();
        const uuidBuffer = Buffer.from(uuidParse(newUuid));

        await dbPool.query(
            'INSERT INTO students (uid, name, email, phone, date_of_birth) VALUES (?, ?, ?, ?, ?)',
            [uuidBuffer, name, email, phone, date]
        );

        res.json({ status: 'success', uid: newUuid });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Error creating user');
    }
});

    // Update user 
    app.post('/update', async (req, res) => {
        const id = req.body.data.id;
        const name = req.body.data.name;
        const email = req.body.data.email;
        const phone = req.body.data.phone;
        const date = req.body.data.date_of_birth;
        // Get existing user details 
         try {
            // Update user details 
            try {
            await dbPool.query(`UPDATE students SET name='${name}', email='${email}', phone='${phone}', date_of_birth='${date}' WHERE id='${id}';`);
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