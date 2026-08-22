const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../dayflow.db');
const schemaPath = path.join(__dirname, 'schema/schema.sql');
const seedPath = path.join(__dirname, 'seeds/seed.sql');

console.log('🚀 Initializing Dayflow HRMS Database...');
console.log(`📁 Database Path: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database Connection Error:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database.');
});

// Enable Foreign Key support
db.run('PRAGMA foreign_keys = ON;', (err) => {
    if (err) console.error('Warning: Failed to enable foreign keys:', err.message);
});

// Read and execute schema
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
const seedSql = fs.readFileSync(seedPath, 'utf8');

db.serialize(() => {
    console.log('📜 Executing DDL Schema...');
    db.exec(schemaSql, (err) => {
        if (err) {
            console.error('❌ Error executing schema.sql:', err.message);
            db.close();
            process.exit(1);
        }
        console.log('✅ Tables and Indexes created successfully.');

        console.log('🌱 Executing Seed SQL...');
        db.exec(seedSql, (err) => {
            if (err) {
                console.error('❌ Error executing seed.sql:', err.message);
                db.close();
                process.exit(1);
            }
            console.log('✅ Seed data inserted successfully.');
            
            // Verification check
            db.get("SELECT COUNT(*) AS userCount FROM users", (err, row) => {
                if (!err) {
                    console.log(`🎉 Database ready! Initialized with ${row.userCount} users.`);
                }
                db.close();
            });
        });
    });
});
