import { csvAnalystStreaming } from "..";

// Sample input same format as parsed csv.
const sampleInput = [
  {
    ADR: "120",
    Available_Rooms: "30",
    Average_Review_Score: "4.5",
    Booking_Channel: "Direct",
    Bookings: "10",
  },
  {
    ADR: "125",
    Available_Rooms: "32",
    Average_Review_Score: "4.6",
    Booking_Channel: "OTA",
    Bookings: "9",
  },
  {
    ADR: "130",
    Available_Rooms: "33",
    Average_Review_Score: "4.7",
    Booking_Channel: "Direct",
    Bookings: "8",
  },
  {
    ADR: "120",
    Available_Rooms: "30",
    Average_Review_Score: "4.5",
    Booking_Channel: "Direct",
    Bookings: "10",
  },
  {
    ADR: "125",
    Available_Rooms: "32",
    Average_Review_Score: "4.6",
    Booking_Channel: "OTA",
    Bookings: "9",
  },
  {
    ADR: "130",
    Available_Rooms: "33",
    Average_Review_Score: "4.7",
    Booking_Channel: "Direct",
    Bookings: "8",
  },
  {
    ADR: "120",
    Available_Rooms: "30",
    Average_Review_Score: "4.5",
    Booking_Channel: "Direct",
    Bookings: "10",
  },
  {
    ADR: "125",
    Available_Rooms: "32",
    Average_Review_Score: "4.6",
    Booking_Channel: "OTA",
    Bookings: "9",
  },
  {
    ADR: "130",
    Available_Rooms: "33",
    Average_Review_Score: "4.7",
    Booking_Channel: "Direct",
    Bookings: "8",
  },
  {
    ADR: "120",
    Available_Rooms: "30",
    Average_Review_Score: "4.5",
    Booking_Channel: "Direct",
    Bookings: "10",
  },
  {
    ADR: "125",
    Available_Rooms: "32",
    Average_Review_Score: "4.6",
    Booking_Channel: "OTA",
    Bookings: "9",
  },
  {
    ADR: "130",
    Available_Rooms: "33",
    Average_Review_Score: "4.7",
    Booking_Channel: "Direct",
    Bookings: "8",
  },
  {
    ADR: "120",
    Available_Rooms: "30",
    Average_Review_Score: "4.5",
    Booking_Channel: "Direct",
    Bookings: "10",
  },
  {
    ADR: "125",
    Available_Rooms: "32",
    Average_Review_Score: "4.6",
    Booking_Channel: "OTA",
    Bookings: "9",
  },
  {
    ADR: "130",
    Available_Rooms: "33",
    Average_Review_Score: "4.7",
    Booking_Channel: "Direct",
    Bookings: "8",
  },
];

const runAnalysis = async () => {
  await csvAnalystStreaming(sampleInput);
};

runAnalysis();
