import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});


export const seedDatabase = async (): Promise<void> => {
   const { pool } = await import("../config/database");
 
try{ 

 const email= process.env.ADMIN_EMAIL;
 const  password= process.env.ADMIN_PASSWORD;

 if (!email || !password) {
  throw new Error(
    "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env"
  );
} 
const admin = {
  name: "System Admin",
  email, 
  password,
};

    const adminPasswordHash = await bcrypt.hash(admin.password, 10);

    const adminResult = await pool.query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'ADMIN')
     ON CONFLICT (email)
    DO UPDATE 
     SET password_hash = EXCLUDED.password_hash,
     name = EXCLUDED.name,
     role = 'ADMIN'
     RETURNING id, email, name, role`,
    [ admin.email, adminPasswordHash,admin.name]
  );

const adminUser =  adminResult.rows[0];
console.log("Admin seeded:", adminResult.rows[0].email);
const createdUsers= [adminUser]; 


// Insert regular users.

  const users = [
  {
    name: "Sagar Bhandari",
    email: "sagar@eventbook.com",
    password: "UserPassword123!",
  },
  {
    name: "Sujal Panthi",
    email: "sujal@eventbook.com",
    password: "UserPassword123!",
  },
];
for (const user of users) {
    const userPasswordHash = await bcrypt.hash(user.password, 10);
    const userResult =  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'USER')
     ON CONFLICT (email)
     DO UPDATE SET
       name = EXCLUDED.name,
       password_hash = EXCLUDED.password_hash,
       role = 'USER',
       updated_at = NOW()
       RETURNING id, name, email, role`,
    [user.name, user.email, userPasswordHash]
  )
  createdUsers.push(userResult.rows[0]);
}

console.log("Regular users seeded.",createdUsers.length - 1);



const now = Date.now();
const days = (value: number) => value * 24 * 60 * 60 * 1000;


const events = [
  {
    title: "Computer Architecture and Operating Systems",
    description:
      "Explore how CPUs execute instructions, how operating systems manage processes and memory, and how hardware and software work together.",
    starts_at: new Date(now + days(10)),
    ends_at: new Date(now + days(10) + days(1 / 12)),
    venue: "Butwal Technical Conference Center",
    total_seats: 80,
  },
  {
    title: "GPU Computing and AI Hardware",
    description:
      "Learn about GPU architecture, parallel processing, CUDA fundamentals, and how GPUs accelerate machine learning and scientific computing.",
    starts_at: new Date(now + days(12)),
    ends_at: new Date(now + days(12) + days(1 / 12)),
    venue: "Silicon Innovation Hub",
    total_seats: 3,
  },
  {
    title: "Cybersecurity and Ethical Hacking Workshop",
    description:
      "Discover network security, common web vulnerabilities, secure authentication, and ethical penetration-testing fundamentals.",
    starts_at: new Date(now + days(15)),
    ends_at: new Date(now + days(15) + days(1 / 12)),
    venue: "Butwal IT Training Center",
    total_seats: 50,
  },
  {
    title: "Full-Stack Web Development with MERN",
    description:
      "Build modern web applications using MongoDB, Express, React, and Node.js. Learn REST API design, authentication, and full-stack architecture.",
    starts_at: new Date(now + days(18)),
    ends_at: new Date(now + days(18) + days(1 / 12)),
    venue: "Butwal Software Innovation Center",
    total_seats: 60,
  },
  {
    title: "PostgreSQL and Database Design",
    description:
      "Learn relational database design, SQL queries, joins, indexes, constraints, transactions, and practical PostgreSQL optimization.",
    starts_at: new Date(now + days(20)),
    ends_at: new Date(now + days(20) + days(1 / 12)),
    venue: "Lumbini Technology Hub",
    total_seats: 25,
  },
  {
    title: "Generative AI and Machine Learning",
    description:
      "Explore machine learning fundamentals, large language models, generative AI applications, and responsible AI development.",
    starts_at: new Date(now + days(23)),
    ends_at: new Date(now + days(23) + days(1 / 12)),
    venue: "AI Research and Learning Center",
    total_seats: 100,
  },
  {
    title: "Cloud Computing and DevOps Fundamentals",
    description:
      "Understand cloud infrastructure, deployment workflows, CI/CD pipelines, Docker containers, and application monitoring.",
    starts_at: new Date(now + days(26)),
    ends_at: new Date(now + days(26) + days(1 / 12)),
    venue: "Butwal Digital Campus",
    total_seats: 40,
  },
  {
    title: "React and Next.js Modern Frontend",
    description:
      "Explore reusable React components, state management, TypeScript, Next.js routing, rendering strategies, and frontend performance.",
    starts_at: new Date(now + days(29)),
    ends_at: new Date(now + days(29) + days(1 / 12)),
    venue: "Web Developers Community Hall",
    total_seats: 2,
  },
  {
    title: "REST API Design and Backend Engineering",
    description:
      "Practice RESTful API design, request validation, authentication, authorization, error handling, and reliable backend architecture.",
    starts_at: new Date(now + days(32)),
    ends_at: new Date(now + days(32) + days(1 / 12)),
    venue: "Butwal Engineering Workshop Center",
    total_seats: 35,
  },
];



const createdEvents: {
  id: string;
  title: string;
  starts_at: Date;
  venue: string;
  total_seats: number;
}[] = [];

 for (const event of events){
 const existingEvent = await pool.query(
    `SELECT id, title, starts_at, venue, total_seats
     FROM events
     WHERE title = $1`,
    [event.title]
  );

   if (existingEvent.rows.length > 0) {
    createdEvents.push(existingEvent.rows[0]);
    continue;
  }

  const res= await pool.query(
    `INSERT INTO events (title, description, starts_at,ends_at, venue, total_seats)
       VALUES ($1, $2, $3, $4, $5, $6 )
       RETURNING id, title, starts_at, venue, total_seats`,
      [event.title, event.description, event.starts_at,event.ends_at, event.venue, event.total_seats]
  );
  createdEvents.push(res.rows[0]);
 };
 console.log("Events seeded:", createdEvents.length);

createdEvents.forEach((event) => {
  console.log(`- ${event.title} | ${event.total_seats} seats`);
});

const normalUser1 = createdUsers[1];
const normalUser2 = createdUsers[2];

const gpuEvent = createdEvents[1];

await pool.query(
  `INSERT INTO bookings (event_id, user_id, status)
  VALUES ($1, $2, 'ACTIVE'),
  ($1, $3, 'ACTIVE')
  ON CONFLICT (event_id, user_id)
  WHERE status = 'ACTIVE'
  DO NOTHING`,
  [gpuEvent.id, normalUser1.id, normalUser2.id]
);

//  Event 8: React and Next.js — 2 of 2 seats booked.
const reactEvent = createdEvents[7];

await pool.query(
  `INSERT INTO bookings (event_id, user_id, status)
   VALUES ($1, $2, 'ACTIVE'),
            ($1, $3, 'ACTIVE')
    ON CONFLICT (event_id, user_id)
    WHERE status = 'ACTIVE'
    DO NOTHING`,
  [reactEvent.id, normalUser1.id,normalUser2.id]
);
console.log("Seed bookings processed successfully.");

console.log("Database seeding completed successfully.");

}catch(error){
   console.error('database seeding failed:', error);
    throw error;

}finally{
    await pool.end();
}

};
seedDatabase().catch((error) => {
  console.error("Seeding failed:", error);
  process.exitCode = 1;
});