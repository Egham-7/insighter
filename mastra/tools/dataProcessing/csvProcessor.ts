// mastra/tools/dataProcessing/csvProcessor.ts

export function processCSVData(data: any[]): Record<string, any>[] {
  return data.map((row) => {
    const processedRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      if (
        typeof value === "string" &&
        !isNaN(parseFloat(value)) &&
        value !== ""
      ) {
        processedRow[key] = parseFloat(value);
      } else {
        processedRow[key] = value;
      }
    }
    return processedRow;
  });
}

// Sample input
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

// Run the function with the sample input
const processedData = processCSVData(sampleInput);
console.log("Processed Data:", processedData);
