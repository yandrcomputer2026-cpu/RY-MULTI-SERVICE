// lib/hotel-api.ts

// ======================================================
// HOTEL API ADAPTER
// ======================================================
//
// यह file हमारे application और Hotel provider के बीच
// एक common layer का काम करेगी.
//
// अभी DEMO provider इस्तेमाल हो रहा है.
// बाद में इसी जगह real Hotel API जोड़ी जाएगी.
// ======================================================

// ======================================================
// TYPES
// ======================================================

export type HotelSearchRequest = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
};

export type HotelSearchResult = {
  hotelId: string;
  hotelName: string;
  city: string;
  location: string;
  rating: number;
  reviews: number;
  roomType: string;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  available: boolean;
};

export type HotelRoom = {
  roomId: string;
  hotelId: string;
  roomType: string;
  mealPlan: string;
  maxGuests: number;
  availableRooms: number;
  pricePerNight: number;
  currency: string;
  refundable: boolean;
  amenities: string[];
};

export type HotelAvailabilityRequest = {
  hotelId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
};

export type HotelAvailabilityResult = {
  roomId: string;
  hotelId: string;
  roomType: string;
  mealPlan: string;
  maxGuests: number;
  availableRooms: number;
  requestedRooms: number;
  requestedGuests: number;
  pricePerNight: number;
  nights: number;
  roomFare: number;
  currency: string;
  refundable: boolean;
  amenities: string[];
};

export type HotelBookingRequest = {
  hotelId: string;
  hotelName: string;
  city: string;
  location: string;

  roomId: string;
  roomType: string;
  mealPlan: string;
  refundable: boolean;

  checkIn: string;
  checkOut: string;

  guests: number;
  rooms: number;

  guestName: string;
  guestAge: number;
  guestGender: string;
  guestMobile: string;
};

export type HotelBookingResult = {
  provider: string;

  confirmationId: string | null;

  status:
    | "PENDING"
    | "CONFIRMED"
    | "FAILED";

  hotel: {
    hotelId: string;
    hotelName: string;
    city: string;
    location: string;
  };

  room: {
    roomId: string;
    roomType: string;
    mealPlan: string;
  };

  stay: {
    checkIn: string;
    checkOut: string;
    guests: number;
    rooms: number;
    nights: number;
  };

  amount: {
    pricePerNight: number;
    roomFare: number;
    convenienceFee: number;
    totalAmount: number;
    currency: string;
  };
};

// ======================================================
// PROVIDER INTERFACE
// ======================================================

export interface HotelProvider {
  searchHotels(
    request: HotelSearchRequest
  ): Promise<HotelSearchResult[]>;

  getAvailability(
    request: HotelAvailabilityRequest
  ): Promise<HotelAvailabilityResult[]>;

  createBooking(
    request: HotelBookingRequest
  ): Promise<HotelBookingResult>;
}

// ======================================================
// DATE HELPERS
// ======================================================

function calculateNights(
  checkIn: string,
  checkOut: string
) {
  const start =
    new Date(
      `${checkIn}T00:00:00`
    );

  const end =
    new Date(
      `${checkOut}T00:00:00`
    );

  const difference =
    end.getTime() -
    start.getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
}

// ======================================================
// DEMO HOTEL DATA
// ======================================================

const demoHotels: HotelSearchResult[] = [
  {
    hotelId: "HOTEL001",
    hotelName:
      "Hotel Royal Palace",
    city: "Lucknow",
    location:
      "Hazratganj",
    rating: 4.3,
    reviews: 248,
    roomType:
      "Deluxe Room",
    pricePerNight: 2499,
    currency: "INR",
    amenities: [
      "Free WiFi",
      "AC",
      "Breakfast",
      "Parking",
    ],
    available: true,
  },

  {
    hotelId: "HOTEL002",
    hotelName:
      "The Grand Residency",
    city: "Lucknow",
    location:
      "Gomti Nagar",
    rating: 4.6,
    reviews: 412,
    roomType:
      "Executive Room",
    pricePerNight: 3299,
    currency: "INR",
    amenities: [
      "Free WiFi",
      "AC",
      "Breakfast",
      "Swimming Pool",
    ],
    available: true,
  },

  {
    hotelId: "HOTEL003",
    hotelName:
      "City Comfort Inn",
    city: "Delhi",
    location:
      "Karol Bagh",
    rating: 4.1,
    reviews: 186,
    roomType:
      "Standard Room",
    pricePerNight: 1899,
    currency: "INR",
    amenities: [
      "Free WiFi",
      "AC",
      "Parking",
    ],
    available: true,
  },

  {
    hotelId: "HOTEL004",
    hotelName:
      "Hotel Green View",
    city: "Jaipur",
    location:
      "MI Road",
    rating: 4.4,
    reviews: 327,
    roomType:
      "Premium Room",
    pricePerNight: 2799,
    currency: "INR",
    amenities: [
      "Free WiFi",
      "AC",
      "Breakfast",
      "Parking",
    ],
    available: true,
  },

  {
    hotelId: "HOTEL005",
    hotelName:
      "Sunrise Residency",
    city: "Delhi",
    location:
      "Paharganj",
    rating: 4.0,
    reviews: 142,
    roomType:
      "Deluxe Room",
    pricePerNight: 2199,
    currency: "INR",
    amenities: [
      "Free WiFi",
      "AC",
      "Room Service",
    ],
    available: true,
  },

  {
    hotelId: "HOTEL006",
    hotelName:
      "Royal Heritage Hotel",
    city: "Jaipur",
    location:
      "Bani Park",
    rating: 4.5,
    reviews: 389,
    roomType:
      "Executive Room",
    pricePerNight: 3499,
    currency: "INR",
    amenities: [
      "Free WiFi",
      "AC",
      "Breakfast",
      "Pool",
    ],
    available: true,
  },
];

// ======================================================
// DEMO ROOM DATA
// ======================================================

const demoRooms: HotelRoom[] = [
  {
    roomId:
      "ROOM001",
    hotelId:
      "HOTEL001",
    roomType:
      "Deluxe Room",
    mealPlan:
      "Room Only",
    maxGuests: 2,
    availableRooms: 5,
    pricePerNight: 2499,
    currency: "INR",
    refundable: true,
    amenities: [
      "Free WiFi",
      "AC",
      "TV",
      "Parking",
    ],
  },

  {
    roomId:
      "ROOM002",
    hotelId:
      "HOTEL001",
    roomType:
      "Deluxe Room",
    mealPlan:
      "Breakfast Included",
    maxGuests: 2,
    availableRooms: 3,
    pricePerNight: 2899,
    currency: "INR",
    refundable: true,
    amenities: [
      "Free WiFi",
      "AC",
      "TV",
      "Breakfast",
      "Parking",
    ],
  },

  {
    roomId:
      "ROOM003",
    hotelId:
      "HOTEL001",
    roomType:
      "Executive Room",
    mealPlan:
      "Breakfast Included",
    maxGuests: 3,
    availableRooms: 2,
    pricePerNight: 3499,
    currency: "INR",
    refundable: false,
    amenities: [
      "Free WiFi",
      "AC",
      "TV",
      "Breakfast",
      "Room Service",
    ],
  },

  {
    roomId:
      "ROOM004",
    hotelId:
      "HOTEL002",
    roomType:
      "Executive Room",
    mealPlan:
      "Room Only",
    maxGuests: 2,
    availableRooms: 4,
    pricePerNight: 3299,
    currency: "INR",
    refundable: true,
    amenities: [
      "Free WiFi",
      "AC",
      "TV",
      "Parking",
    ],
  },

  {
    roomId:
      "ROOM005",
    hotelId:
      "HOTEL002",
    roomType:
      "Executive Room",
    mealPlan:
      "Breakfast Included",
    maxGuests: 2,
    availableRooms: 2,
    pricePerNight: 3699,
    currency: "INR",
    refundable: true,
    amenities: [
      "Free WiFi",
      "AC",
      "Breakfast",
      "Swimming Pool",
    ],
  },

  {
    roomId:
      "ROOM006",
    hotelId:
      "HOTEL003",
    roomType:
      "Standard Room",
    mealPlan:
      "Room Only",
    maxGuests: 2,
    availableRooms: 6,
    pricePerNight: 1899,
    currency: "INR",
    refundable: true,
    amenities: [
      "Free WiFi",
      "AC",
      "Parking",
    ],
  },

  {
    roomId:
      "ROOM007",
    hotelId:
      "HOTEL004",
    roomType:
      "Premium Room",
    mealPlan:
      "Breakfast Included",
    maxGuests: 3,
    availableRooms: 3,
    pricePerNight: 2799,
    currency: "INR",
    refundable: true,
    amenities: [
      "Free WiFi",
      "AC",
      "Breakfast",
      "Parking",
    ],
  },

  {
    roomId:
      "ROOM008",
    hotelId:
      "HOTEL005",
    roomType:
      "Deluxe Room",
    mealPlan:
      "Room Only",
    maxGuests: 2,
    availableRooms: 5,
    pricePerNight: 2199,
    currency: "INR",
    refundable: false,
    amenities: [
      "Free WiFi",
      "AC",
      "Room Service",
    ],
  },

  {
    roomId:
      "ROOM009",
    hotelId:
      "HOTEL006",
    roomType:
      "Executive Room",
    mealPlan:
      "Breakfast Included",
    maxGuests: 3,
    availableRooms: 2,
    pricePerNight: 3499,
    currency: "INR",
    refundable: true,
    amenities: [
      "Free WiFi",
      "AC",
      "Breakfast",
      "Pool",
    ],
  },
];

// ======================================================
// DEMO PROVIDER
// ======================================================

class DemoHotelProvider
  implements HotelProvider {
  // ====================================================
  // SEARCH
  // ====================================================

  async searchHotels(
    request: HotelSearchRequest
  ): Promise<HotelSearchResult[]> {
    const search =
      request.city
        .trim()
        .toLowerCase();

    return demoHotels.filter(
      (hotel) => {
        const searchable =
          [
            hotel.hotelName,
            hotel.city,
            hotel.location,
          ]
            .join(" ")
            .toLowerCase();

        return searchable.includes(
          search
        );
      }
    );
  }

  // ====================================================
  // AVAILABILITY
  // ====================================================

  async getAvailability(
    request: HotelAvailabilityRequest
  ): Promise<HotelAvailabilityResult[]> {
    const nights =
      calculateNights(
        request.checkIn,
        request.checkOut
      );

    if (
      nights <= 0
    ) {
      return [];
    }

    return demoRooms
      .filter(
        (room) =>
          room.hotelId ===
            request.hotelId &&
          room.maxGuests >=
            request.guests &&
          room.availableRooms >=
            request.rooms
      )
      .map(
        (room) => ({
          roomId:
            room.roomId,

          hotelId:
            room.hotelId,

          roomType:
            room.roomType,

          mealPlan:
            room.mealPlan,

          maxGuests:
            room.maxGuests,

          availableRooms:
            room.availableRooms,

          requestedRooms:
            request.rooms,

          requestedGuests:
            request.guests,

          pricePerNight:
            room.pricePerNight,

          nights,

          roomFare:
            room.pricePerNight *
            nights *
            request.rooms,

          currency:
            room.currency,

          refundable:
            room.refundable,

          amenities:
            room.amenities,
        })
      );
  }

  // ====================================================
  // BOOKING
  // ====================================================

  async createBooking(
    request: HotelBookingRequest
  ): Promise<HotelBookingResult> {
    const room =
      demoRooms.find(
        (item) =>
          item.roomId ===
          request.roomId
      );

    if (!room) {
      return {
        provider:
          "DEMO_HOTEL_PROVIDER",

        confirmationId:
          null,

        status:
          "FAILED",

        hotel: {
          hotelId:
            request.hotelId,

          hotelName:
            request.hotelName,

          city:
            request.city,

          location:
            request.location,
        },

        room: {
          roomId:
            request.roomId,

          roomType:
            request.roomType,

          mealPlan:
            request.mealPlan,
        },

        stay: {
          checkIn:
            request.checkIn,

          checkOut:
            request.checkOut,

          guests:
            request.guests,

          rooms:
            request.rooms,

          nights: 0,
        },

        amount: {
          pricePerNight:
            0,

          roomFare:
            0,

          convenienceFee:
            0,

          totalAmount:
            0,

          currency:
            "INR",
        },
      };
    }

    const nights =
      calculateNights(
        request.checkIn,
        request.checkOut
      );

    const roomFare =
      room.pricePerNight *
      nights *
      request.rooms;

    const convenienceFee =
      50;

    const totalAmount =
      roomFare +
      convenienceFee;

    // ----------------------------------------------
    // Demo confirmation
    // ----------------------------------------------

    const confirmationId =
      `DEMO-HOTEL-${Date.now()}`;

    return {
      provider:
        "DEMO_HOTEL_PROVIDER",

      confirmationId,

      status:
        "CONFIRMED",

      hotel: {
        hotelId:
          request.hotelId,

        hotelName:
          request.hotelName,

        city:
          request.city,

        location:
          request.location,
      },

      room: {
        roomId:
          room.roomId,

        roomType:
          room.roomType,

        mealPlan:
          room.mealPlan,
      },

      stay: {
        checkIn:
          request.checkIn,

        checkOut:
          request.checkOut,

        guests:
          request.guests,

        rooms:
          request.rooms,

        nights,
      },

      amount: {
        pricePerNight:
          room.pricePerNight,

        roomFare,

        convenienceFee,

        totalAmount,

        currency:
          room.currency,
      },
    };
  }
}

// ======================================================
// REMOTE HOTEL PROVIDER
// ======================================================
//
// अभी actual Hotel API documentation available नहीं है.
//
// इसलिए:
// - कोई fake endpoint नहीं
// - कोई fake response नहीं
// - कोई guessed authentication नहीं
//
// Documentation मिलने के बाद इसी class में real API
// implementation जोड़ी जाएगी.
// ======================================================

class RemoteHotelProvider
  implements HotelProvider {
  private getBaseUrl() {
    const baseUrl =
      process.env.HOTEL_API_BASE_URL?.trim();

    if (!baseUrl) {
      throw new Error(
        "HOTEL_API_BASE_URL is not configured."
      );
    }

    return baseUrl.replace(
      /\/+$/,
      ""
    );
  }

  async searchHotels(
    _request: HotelSearchRequest
  ): Promise<HotelSearchResult[]> {
    this.getBaseUrl();

    throw new Error(
      "Remote Hotel API search is not configured yet. Provider documentation is required."
    );
  }

  async getAvailability(
    _request: HotelAvailabilityRequest
  ): Promise<HotelAvailabilityResult[]> {
    this.getBaseUrl();

    throw new Error(
      "Remote Hotel API availability is not configured yet. Provider documentation is required."
    );
  }

  async createBooking(
    _request: HotelBookingRequest
  ): Promise<HotelBookingResult> {
    this.getBaseUrl();

    throw new Error(
      "Remote Hotel API booking is not configured yet. Provider documentation is required."
    );
  }
}

// ======================================================
// PROVIDER FACTORY
// ======================================================
//
// demo:
//     current working demo system
//
// remote:
//     future real hotel API
//
// अभी .env में demo रखने पर existing system पर
// कोई असर नहीं पड़ेगा.
// ======================================================

export function getHotelProvider(): HotelProvider {
  const provider =
    (
      process.env
        .HOTEL_API_PROVIDER ||
      "demo"
    )
      .trim()
      .toLowerCase();

  switch (provider) {
    case "remote":
      return new RemoteHotelProvider();

    case "demo":
    default:
      return new DemoHotelProvider();
  }
}