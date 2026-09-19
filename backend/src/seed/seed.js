require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Internship = require("../models/Internship");
const Application = require("../models/Application");
const UserInteraction = require("../models/UserInteraction");
const { parseStipendAmount } = require("../services/matching/stipendParse.util");
const { demoUser, internships, demoApplicationStatuses } = require("./seedData");

async function destroy() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Internship.deleteMany({}),
    Application.deleteMany({}),
    UserInteraction.deleteMany({}),
  ]);
  console.log("[seed] Database cleared.");
  await mongoose.disconnect();
}

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Internship.deleteMany({}),
    Application.deleteMany({}),
    UserInteraction.deleteMany({}),
  ]);

  const user = await User.create(demoUser);
  console.log(`[seed] Created demo user: ${user.email} (password: ${demoUser.password})`);

  const internshipDocs = await Internship.insertMany(
    internships.map((i) => ({
      ...i,
      stipendAmount: parseStipendAmount(i.stipend),
      createdBy: user._id,
    }))
  );
  console.log(`[seed] Created ${internshipDocs.length} internships.`);

  const applications = [];
  for (const internship of internshipDocs) {
    const status = demoApplicationStatuses[internship.company];
    if (!status) continue;
    applications.push({
      user: user._id,
      internship: internship._id,
      status,
      appliedOn: new Date(),
      oaDate: internship.oaDate || null,
      interviewDate: internship.interviewDate || null,
    });
  }
  await Application.insertMany(applications);
  console.log(`[seed] Created ${applications.length} applications for the demo user.`);

  // A handful of interaction events so the behavioral recommendation layer
  // has something to work with immediately after seeding.
  const interactions = internshipDocs.slice(0, 6).flatMap((internship, idx) => [
    { user: user._id, internship: internship._id, eventType: "VIEW" },
    idx % 2 === 0
      ? { user: user._id, internship: internship._id, eventType: "SAVE" }
      : { user: user._id, internship: internship._id, eventType: "CLICK" },
  ]);
  await UserInteraction.insertMany(interactions);
  console.log(`[seed] Created ${interactions.length} interaction events.`);

  console.log("[seed] Done.");
  await mongoose.disconnect();
}

if (process.argv.includes("--destroy")) {
  destroy().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
