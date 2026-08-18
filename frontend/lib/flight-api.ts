// ======================================================
// FLIGHT API ADAPTER
// ======================================================
//
// यह file हमारे application और Flight API provider
// के बीच common layer का काम करेगी.
//
// अभी DEMO provider इस्तेमाल हो रहा है.
// बाद में TripJack Flight API इसी layer में जोड़ी जाएगी.
// ======================================================

// ======================================================
// TYPES
// ======================================================

export type FlightSearchRequest = {
  from: string;
  to: string;
  journeyDate: string;
  returnDate?: string;
  tripType: "ONE_WAY" | "ROUND_TRIP" | "MULTI_CITY";
  adults: number;
  children: number;
  infants: number;
  cabinClass:
    | "ECONOMY"
    | "PREMIUM_ECONOMY"
    | "BUSINESS"
    | "FIRST";
};

export type FlightSearchResult = {
  flightId: string;

  airlineCode: string;
  airlineName: string;

  flightNumber: string;

  from: string;
  fromName: string;

  to: string;
  toName: string;

  departureTime: string;
  arrivalTime: string;

  duration: string;
  stops: number;

  cabinClass: string;

  refundable: boolean;

  price: number;
  currency: string;

  seatsAvailable: number;
};

export type FlightAvailabilityRequest = {
  flightId: string;

  journeyDate: string;

  adults: number;
  children: number;
  infants: number;

  cabinClass: string;
};

export type FlightFare = {
  baseFare: number;
  taxes: number;
  convenienceFee: number;
  totalAmount: number;
  currency: string;
};

export type FlightAvailabilityResult = {
  flightId: string;

  airlineCode: string;
  airlineName: string;

  flightNumber: string;

  from: string;
  fromName: string;

  to: string;
  toName: string;

  departureTime: string;
  arrivalTime: string;

  duration: string;
  stops: number;

  cabinClass: string;

  seatsAvailable: number;

  refundable: boolean;

  fare: FlightFare;
};

export type FlightBookingRequest = {
  flightId: string;

  airlineCode: string;
  airlineName: string;

  flightNumber: string;

  from: string;
  fromName: string;

  to: string;
  toName: string;

  journeyDate: string;

  adults: number;
  children: number;
  infants: number;

  cabinClass: string;

  passengerName: string;
  passengerAge: number;
  passengerGender: string;
  passengerMobile: string;
};

export type FlightBookingResult = {
  provider: string;

  confirmationId: string | null;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "FAILED";

  flight: {
    flightId: string;

    airlineCode: string;
    airlineName: string;

    flightNumber: string;

    from: string;
    fromName: string;

    to: string;
    toName: string;

    departureTime: string;
    arrivalTime: string;

    duration: string;
    stops: number;

    cabinClass: string;
  };

  passenger: {
    name: string;
    age: number;
    gender: string;
    mobile: string;
  };

  journey: {
    journeyDate: string;

    adults: number;
    children: number;
    infants: number;
  };

  fare: FlightFare;
};

// ======================================================
// PROVIDER INTERFACE
// ======================================================

export interface FlightProvider {
  searchFlights(
    request: FlightSearchRequest
  ): Promise<FlightSearchResult[]>;

  getAvailability(
    request: FlightAvailabilityRequest
  ): Promise<FlightAvailabilityResult>;

  createBooking(
    request: FlightBookingRequest
  ): Promise<FlightBookingResult>;
}

// ======================================================
// DEMO FLIGHT DATA
// ======================================================

const demoFlights: FlightSearchResult[] = [
  {
    flightId: "FLIGHT001",

    airlineCode: "6E",
    airlineName: "IndiGo",

    flightNumber: "6E-203",

    from: "DEL",
    fromName: "Delhi",

    to: "LKO",
    toName: "Lucknow",

    departureTime: "06:20 AM",
    arrivalTime: "07:35 AM",

    duration: "1h 15m",
    stops: 0,

    cabinClass: "ECONOMY",

    refundable: true,

    price: 3499,
    currency: "INR",

    seatsAvailable: 9,
  },

  {
    flightId: "FLIGHT002",

    airlineCode: "AI",
    airlineName: "Air India",

    flightNumber: "AI-431",

    from: "DEL",
    fromName: "Delhi",

    to: "LKO",
    toName: "Lucknow",

    departureTime: "08:10 AM",
    arrivalTime: "09:30 AM",

    duration: "1h 20m",
    stops: 0,

    cabinClass: "ECONOMY",

    refundable: true,

    price: 4299,
    currency: "INR",

    seatsAvailable: 6,
  },

  {
    flightId: "FLIGHT003",

    airlineCode: "IX",
    airlineName: "Air India Express",

    flightNumber: "IX-1642",

    from: "DEL",
    fromName: "Delhi",

    to: "LKO",
    toName: "Lucknow",

    departureTime: "11:45 AM",
    arrivalTime: "01:10 PM",

    duration: "1h 25m",
    stops: 0,

    cabinClass: "ECONOMY",

    refundable: false,

    price: 2999,
    currency: "INR",

    seatsAvailable: 4,
  },

  {
    flightId: "FLIGHT004",

    airlineCode: "6E",
    airlineName: "IndiGo",

    flightNumber: "6E-721",

    from: "LKO",
    fromName: "Lucknow",

    to: "BOM",
    toName: "Mumbai",

    departureTime: "07:05 AM",
    arrivalTime: "09:10 AM",

    duration: "2h 05m",
    stops: 0,

    cabinClass: "ECONOMY",

    refundable: true,

    price: 5199,
    currency: "INR",

    seatsAvailable: 7,
  },

  {
    flightId: "FLIGHT005",

    airlineCode: "AI",
    airlineName: "Air India",

    flightNumber: "AI-626",

    from: "LKO",
    fromName: "Lucknow",

    to: "BOM",
    toName: "Mumbai",

    departureTime: "02:30 PM",
    arrivalTime: "04:45 PM",

    duration: "2h 15m",
    stops: 0,

    cabinClass: "ECONOMY",

    refundable: true,

    price: 5799,
    currency: "INR",

    seatsAvailable: 5,
  },
];

// ======================================================
// DEMO PROVIDER
// ======================================================

class DemoFlightProvider
  implements FlightProvider
{
  // ====================================================
  // SEARCH
  // ====================================================

  async searchFlights(
    request: FlightSearchRequest
  ): Promise<FlightSearchResult[]> {
    const from =
      request.from
        .trim()
        .toUpperCase();

    const to =
      request.to
        .trim()
        .toUpperCase();

    return demoFlights.filter(
      (flight) =>
        flight.from === from &&
        flight.to === to &&
        flight.seatsAvailable >=
          request.adults +
            request.children +
            request.infants &&
        flight.cabinClass ===
          request.cabinClass
    );
  }

  // ====================================================
  // AVAILABILITY
  // ====================================================

  async getAvailability(
    request: FlightAvailabilityRequest
  ): Promise<FlightAvailabilityResult> {
    const flight =
      demoFlights.find(
        (item) =>
          item.flightId ===
          request.flightId
      );

    if (!flight) {
      throw new Error(
        "Flight not found."
      );
    }

    const totalPassengers =
      request.adults +
      request.children +
      request.infants;

    if (
      flight.seatsAvailable <
      totalPassengers
    ) {
      throw new Error(
        "Required seats are not available."
      );
    }

    const passengerCount =
      request.adults +
      request.children +
      request.infants;

    const baseFare =
      flight.price *
      passengerCount;

    const taxes =
      Math.round(
        baseFare * 0.12
      );

    const convenienceFee =
      50;

    const totalAmount =
      baseFare +
      taxes +
      convenienceFee;

    return {
      flightId:
        flight.flightId,

      airlineCode:
        flight.airlineCode,

      airlineName:
        flight.airlineName,

      flightNumber:
        flight.flightNumber,

      from:
        flight.from,

      fromName:
        flight.fromName,

      to:
        flight.to,

      toName:
        flight.toName,

      departureTime:
        flight.departureTime,

      arrivalTime:
        flight.arrivalTime,

      duration:
        flight.duration,

      stops:
        flight.stops,

      cabinClass:
        flight.cabinClass,

      seatsAvailable:
        flight.seatsAvailable,

      refundable:
        flight.refundable,

      fare: {
        baseFare,

        taxes,

        convenienceFee,

        totalAmount,

        currency:
          flight.currency,
      },
    };
  }

  // ====================================================
  // BOOKING
  // ====================================================

  async createBooking(
    request: FlightBookingRequest
  ): Promise<FlightBookingResult> {
    const flight =
      demoFlights.find(
        (item) =>
          item.flightId ===
          request.flightId
      );

    if (!flight) {
      return {
        provider:
          "DEMO_FLIGHT_PROVIDER",

        confirmationId:
          null,

        status:
          "FAILED",

        flight: {
          flightId:
            request.flightId,

          airlineCode:
            request.airlineCode,

          airlineName:
            request.airlineName,

          flightNumber:
            request.flightNumber,

          from:
            request.from,

          fromName:
            request.fromName,

          to:
            request.to,

          toName:
            request.toName,

          departureTime:
            "",

          arrivalTime:
            "",

          duration:
            "",

          stops:
            0,

          cabinClass:
            request.cabinClass,
        },

        passenger: {
          name:
            request.passengerName,

          age:
            request.passengerAge,

          gender:
            request.passengerGender,

          mobile:
            request.passengerMobile,
        },

        journey: {
          journeyDate:
            request.journeyDate,

          adults:
            request.adults,

          children:
            request.children,

          infants:
            request.infants,
        },

        fare: {
          baseFare: 0,

          taxes: 0,

          convenienceFee: 0,

          totalAmount: 0,

          currency: "INR",
        },
      };
    }

    const passengerCount =
      request.adults +
      request.children +
      request.infants;

    const baseFare =
      flight.price *
      passengerCount;

    const taxes =
      Math.round(
        baseFare * 0.12
      );

    const convenienceFee =
      50;

    const totalAmount =
      baseFare +
      taxes +
      convenienceFee;

    const confirmationId =
      `DEMO-FLIGHT-${Date.now()}`;

    return {
      provider:
        "DEMO_FLIGHT_PROVIDER",

      confirmationId,

      status:
        "CONFIRMED",

      flight: {
        flightId:
          flight.flightId,

        airlineCode:
          flight.airlineCode,

        airlineName:
          flight.airlineName,

        flightNumber:
          flight.flightNumber,

        from:
          flight.from,

        fromName:
          flight.fromName,

        to:
          flight.to,

        toName:
          flight.toName,

        departureTime:
          flight.departureTime,

        arrivalTime:
          flight.arrivalTime,

        duration:
          flight.duration,

        stops:
          flight.stops,

        cabinClass:
          flight.cabinClass,
      },

      passenger: {
        name:
          request.passengerName,

        age:
          request.passengerAge,

        gender:
          request.passengerGender,

        mobile:
          request.passengerMobile,
      },

      journey: {
        journeyDate:
          request.journeyDate,

        adults:
          request.adults,

        children:
          request.children,

        infants:
          request.infants,
      },

      fare: {
        baseFare,

        taxes,

        convenienceFee,

        totalAmount,

        currency:
          flight.currency,
      },
    };
  }
}

// ======================================================
// REMOTE FLIGHT PROVIDER
// ======================================================
//
// अभी TripJack की actual credentials नहीं मिली हैं.
//
// इसलिए कोई guessed endpoint या fake API request
// नहीं बनाया जा रहा.
//
// Credentials + official API contract मिलने के बाद
// इसी class में real TripJack Flight API जोड़ी जाएगी.
// ======================================================

class RemoteFlightProvider
  implements FlightProvider
{
  private getBaseUrl() {
    const baseUrl =
      process.env
        .FLIGHT_API_BASE_URL?.trim();

    if (!baseUrl) {
      throw new Error(
        "FLIGHT_API_BASE_URL is not configured."
      );
    }

    return baseUrl.replace(
      /\/+$/,
      ""
    );
  }

  async searchFlights(
    _request: FlightSearchRequest
  ): Promise<FlightSearchResult[]> {
    this.getBaseUrl();

    throw new Error(
      "Remote Flight API search अभी configure नहीं है."
    );
  }

  async getAvailability(
    _request: FlightAvailabilityRequest
  ): Promise<FlightAvailabilityResult> {
    this.getBaseUrl();

    throw new Error(
      "Remote Flight API availability अभी configure नहीं है."
    );
  }

  async createBooking(
    _request: FlightBookingRequest
  ): Promise<FlightBookingResult> {
    this.getBaseUrl();

    throw new Error(
      "Remote Flight API booking अभी configure नहीं है."
    );
  }
}

// ======================================================
// PROVIDER FACTORY
// ======================================================

export function getFlightProvider(): FlightProvider {
  const provider =
    (
      process.env
        .FLIGHT_API_PROVIDER ||
      "demo"
    )
      .trim()
      .toLowerCase();

  switch (
    provider
  ) {
    case "remote":
      return new RemoteFlightProvider();

    case "demo":
    default:
      return new DemoFlightProvider();
  }
}