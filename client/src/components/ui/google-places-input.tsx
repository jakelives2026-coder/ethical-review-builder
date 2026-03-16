/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, MapPin, Building2, Loader2, X, Pencil } from "lucide-react";

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces?: () => void;
  }
}

type PlaceResult = {
  name: string;
  formatted_address: string;
  place_id: string;
  types?: string[];
};

const placeTypeToService: Record<string, string> = {
  restaurant: "Restaurant & Dining",
  cafe: "Cafe & Coffee Shop",
  bar: "Bar & Nightlife",
  bakery: "Bakery",
  meal_delivery: "Food Delivery",
  meal_takeaway: "Takeaway Food",
  hair_care: "Hair Salon & Styling",
  beauty_salon: "Beauty & Spa Services",
  spa: "Spa & Wellness",
  gym: "Fitness & Gym",
  dentist: "Dental Services",
  doctor: "Medical Practice",
  hospital: "Healthcare Services",
  pharmacy: "Pharmacy",
  veterinary_care: "Veterinary Services",
  lawyer: "Legal Services",
  accounting: "Accounting & Tax Services",
  real_estate_agency: "Real Estate Services",
  insurance_agency: "Insurance Services",
  bank: "Banking & Financial Services",
  car_dealer: "Car Dealership",
  car_repair: "Auto Repair & Maintenance",
  car_wash: "Car Wash",
  gas_station: "Gas Station",
  electrician: "Electrical Services",
  plumber: "Plumbing Services",
  roofing_contractor: "Roofing Services",
  painter: "Painting Services",
  locksmith: "Locksmith Services",
  moving_company: "Moving & Relocation",
  storage: "Storage Solutions",
  laundry: "Laundry & Dry Cleaning",
  clothing_store: "Clothing & Apparel",
  shoe_store: "Footwear Retail",
  jewelry_store: "Jewelry Retail",
  electronics_store: "Electronics Retail",
  furniture_store: "Furniture Retail",
  hardware_store: "Hardware & Tools",
  home_goods_store: "Home Goods",
  pet_store: "Pet Supplies",
  florist: "Florist & Flowers",
  book_store: "Books & Stationery",
  grocery_or_supermarket: "Grocery & Supermarket",
  convenience_store: "Convenience Store",
  liquor_store: "Liquor Store",
  school: "Education",
  university: "Higher Education",
  library: "Library Services",
  lodging: "Hotel & Lodging",
  travel_agency: "Travel Services",
  general_contractor: "General Contracting",
  hvac: "HVAC Services",
  landscaping: "Landscaping & Lawn Care",
  flooring_store: "Flooring Installation & Sales",
  flooring_contractor: "Flooring Installation",
  floor_store: "Flooring Installation & Sales",
  home_improvement_store: "Home Improvement",
  contractor: "Contracting Services",
  home_improvement: "Home Improvement Services",
  carpet_store: "Carpet & Flooring",
  tile_store: "Tile & Flooring",
  window_installation: "Window Installation",
  door_installation: "Door Installation",
  kitchen_remodeler: "Kitchen Remodeling",
  bathroom_remodeler: "Bathroom Remodeling",
  cabinet_store: "Cabinets & Storage",
  countertop_store: "Countertops",
  fence_contractor: "Fencing Services",
  deck_contractor: "Deck Building",
  pool_builder: "Pool Construction",
  solar_panel_installer: "Solar Installation",
  garage_door_supplier: "Garage Door Services",
  gutter_cleaning_service: "Gutter Services",
  tree_service: "Tree Services",
  pest_control: "Pest Control",
  cleaning_service: "Cleaning Services",
  maid_service: "Housekeeping Services",
  lawn_care_service: "Lawn Care",
  garden_center: "Garden Center",
  nursery: "Plant Nursery",
  fire_protection: "Fire Protection",
  security_system_supplier: "Security Systems",
  alarm_supplier: "Alarm Systems",
  appliance_store: "Appliance Sales & Repair",
  appliance_repair_service: "Appliance Repair",
  air_conditioning_contractor: "AC & Heating",
  heating_contractor: "Heating Services",
  water_damage_restoration: "Water Damage Restoration",
  mold_removal: "Mold Remediation",
  foundation_contractor: "Foundation Repair",
  basement_waterproofing: "Waterproofing Services",
  drywall_contractor: "Drywall Services",
  siding_contractor: "Siding Installation",
  insulation_contractor: "Insulation Services",
  handyman: "Handyman Services",
  home_builder: "Home Building",
  architect: "Architecture Services",
  interior_designer: "Interior Design",
  photographer: "Photography Services",
  videographer: "Videography Services",
  event_planner: "Event Planning",
  caterer: "Catering Services",
  wedding_venue: "Wedding Venue",
  party_venue: "Event Venue",
  art_gallery: "Art Gallery",
  museum: "Museum",
  movie_theater: "Movie Theater",
  amusement_park: "Amusement & Entertainment",
  bowling_alley: "Bowling",
  night_club: "Nightclub & Entertainment",
  casino: "Casino & Gaming",
  tattoo_shop: "Tattoo & Body Art",
  nail_salon: "Nail Salon",
  tanning_salon: "Tanning Salon",
  barbershop: "Barbershop",
  massage_therapist: "Massage Therapy",
  chiropractor: "Chiropractic Services",
  physical_therapist: "Physical Therapy",
  optometrist: "Eye Care",
  psychologist: "Mental Health Services",
  counselor: "Counseling Services",
  notary_public: "Notary Services",
  accountant: "Accounting Services",
  financial_planner: "Financial Planning",
  tax_preparation: "Tax Preparation",
  marketing_agency: "Marketing Services",
  advertising_agency: "Advertising Services",
  web_design: "Web Design & Development",
  it_services: "IT Services",
  computer_repair: "Computer Repair",
  cell_phone_store: "Mobile Phone Sales & Repair",
  dry_cleaner: "Dry Cleaning",
  tailor: "Tailoring & Alterations",
  cobbler: "Shoe Repair",
  watch_repair: "Watch Repair",
  jeweler: "Jewelry Services",
  pawn_shop: "Pawn Shop",
  thrift_store: "Thrift Store",
  antique_store: "Antiques",
  toy_store: "Toy Store",
  sporting_goods_store: "Sporting Goods",
  bicycle_store: "Bicycle Sales & Repair",
  motorcycle_dealer: "Motorcycle Dealership",
  boat_dealer: "Boat Dealership",
  rv_dealer: "RV Dealership",
  auto_body_shop: "Auto Body Repair",
  tire_shop: "Tire Sales & Service",
  auto_parts_store: "Auto Parts",
  towing_service: "Towing Services",
  parking: "Parking Services",
  airport: "Airport",
  train_station: "Train Station",
  bus_station: "Bus Station",
  taxi_stand: "Taxi Services",
  car_rental: "Car Rental",
  limo_service: "Limousine Services",
  courier_service: "Courier & Delivery",
  post_office: "Postal Services",
  print_shop: "Printing Services",
  copy_shop: "Copy & Print Services",
  sign_shop: "Sign Making",
  trophy_shop: "Trophies & Awards",
  embroidery_shop: "Embroidery & Custom Apparel",
  store: "Retail Store",
  point_of_interest: "Local Business",
  establishment: "Business Services",
};

function getServiceFromTypes(types: string[] | undefined): string {
  if (!types || types.length === 0) return "";
  
  for (const type of types) {
    if (placeTypeToService[type]) {
      return placeTypeToService[type];
    }
  }
  return "";
}

type GooglePlacesBusinessInputProps = {
  onBusinessSelect: (business: {
    businessName: string;
    formattedAddress: string;
    placeId: string;
    service?: string;
  }) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  required?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoFocus?: boolean;
};

let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: (() => void)[] = [];

async function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsLoaded) return Promise.resolve();
  
  if (googleMapsLoading) {
    return new Promise((resolve) => {
      loadCallbacks.push(resolve);
    });
  }
  
  googleMapsLoading = true;
  
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('/api/config/google-maps-key');
      if (!response.ok) {
        throw new Error('Failed to get Google Maps API key');
      }
      const { apiKey } = await response.json();
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
      script.async = true;
      script.defer = true;
      
      window.initGooglePlaces = () => {
        googleMapsLoaded = true;
        googleMapsLoading = false;
        resolve();
        loadCallbacks.forEach(cb => cb());
        loadCallbacks.length = 0;
      };
      
      script.onerror = () => {
        googleMapsLoading = false;
        reject(new Error('Failed to load Google Maps script'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      googleMapsLoading = false;
      reject(error);
    }
  });
}

export function GooglePlacesBusinessInput({
  onBusinessSelect,
  placeholder = "Search for a business...",
  className,
  defaultValue = "",
  required = false,
  onFocus,
  autoFocus = false,
}: GooglePlacesBusinessInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [shouldAutoFocus, setShouldAutoFocus] = useState(autoFocus);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        const dummyDiv = document.createElement('div');
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv);
        setIsApiLoading(false);
      })
      .catch(() => {
        setApiError(true);
        setIsApiLoading(false);
        setIsManualMode(true);
      });
  }, []);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (shouldAutoFocus && !isApiLoading && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setShouldAutoFocus(false);
      }, 150);
    }
  }, [shouldAutoFocus, isApiLoading]);
  
  const searchPlaces = useCallback((query: string) => {
    if (!autocompleteServiceRef.current || query.length < 2) {
      setPredictions([]);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        types: ['establishment'],
      },
      (results, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowDropdown(true);
          setSearchError(null);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([]);
          setShowDropdown(false);
          setSearchError(null);
        } else if (status === window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
          setPredictions([]);
          setSearchError('Invalid search query. Please try again.');
        } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          setPredictions([]);
          setSearchError('Search limit reached. Please wait a moment and try again.');
        } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
          setPredictions([]);
          setSearchError('Search service unavailable. Please enter manually.');
        } else {
          setPredictions([]);
          setSearchError('Could not search. Please try again.');
        }
      }
    );
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedPlace(null);
    setSearchError(null);

    if (isManualMode) {
      onBusinessSelect({
        businessName: value,
        formattedAddress: "",
        placeId: "",
        service: undefined,
      });
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };
  
  const handleSelectPlace = (prediction: google.maps.places.AutocompletePrediction) => {
    if (!placesServiceRef.current) return;

    setIsLoading(true);
    setShowDropdown(false);
    setSearchError(null);

    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'place_id', 'types', 'geometry'],
      },
      (place, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const result: PlaceResult = {
            name: place.name || prediction.structured_formatting.main_text,
            formatted_address: place.formatted_address || prediction.description,
            place_id: place.place_id || prediction.place_id,
            types: place.types,
          };

          setSelectedPlace(result);
          setInputValue(result.name);

          const service = getServiceFromTypes(result.types);

          onBusinessSelect({
            businessName: result.name,
            formattedAddress: result.formatted_address,
            placeId: result.place_id,
            service: service || undefined,
          });
        } else {
          setSearchError('Could not load place details. Please try again.');
        }
      }
    );
  };
  
  const handleClearSelection = () => {
    setSelectedPlace(null);
    setInputValue("");
    setPredictions([]);
    setSearchError(null);
    onBusinessSelect({
      businessName: "",
      formattedAddress: "",
      placeId: "",
      service: undefined,
    });
    inputRef.current?.focus();
  };
  
  const handleEnableManualMode = () => {
    setIsManualMode(true);
    setShowDropdown(false);
    setPredictions([]);
    onBusinessSelect({
      businessName: inputValue,
      formattedAddress: "",
      placeId: "",
      service: undefined,
    });
  };
  
  const handleDisableManualMode = () => {
    setIsManualMode(false);
    if (inputValue.length >= 2) {
      searchPlaces(inputValue);
    }
  };
  
  if (isApiLoading) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading search...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative", className)}>
      {selectedPlace && !isManualMode ? (
        <div className="border rounded-md p-3 bg-primary/5 border-primary/20">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium text-sm truncate">{selectedPlace.name}</span>
              </div>
              <div className="flex items-start gap-2 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {selectedPlace.formatted_address}
                </span>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={handleEnableManualMode}
                title="Edit manually"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                onClick={handleClearSelection}
                title="Clear selection"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={isManualMode ? "Enter business name..." : placeholder}
              className={cn("pr-20", className)}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={(e) => {
                onFocus?.(e);
                if (!isManualMode && inputValue.length >= 2 && predictions.length > 0) {
                  setShowDropdown(true);
                }
              }}
              required={required}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              {!isLoading && !isManualMode && <Search className="h-4 w-4 text-muted-foreground" />}
              {isManualMode && !apiError && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={handleDisableManualMode}
                >
                  Search
                </Button>
              )}
            </div>
          </div>

          {searchError && !isManualMode && (
            <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{searchError}</p>
              <button
                type="button"
                onClick={handleEnableManualMode}
                className="text-xs text-destructive underline mt-2 hover:no-underline"
              >
                Try entering manually
              </button>
            </div>
          )}

          {showDropdown && predictions.length > 0 && !isManualMode && (
            <div
              ref={dropdownRef}
              className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {predictions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                  onClick={() => handleSelectPlace(prediction)}
                >
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {prediction.structured_formatting.main_text}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors text-sm text-muted-foreground flex items-center gap-2"
                onClick={handleEnableManualMode}
              >
                <Pencil className="h-4 w-4" />
                <span>Can't find it? Enter manually</span>
              </button>
            </div>
          )}
          
          {isManualMode && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Pencil className="h-3 w-3" />
              Manual entry mode - type the business name directly
            </p>
          )}
        </>
      )}
    </div>
  );
}

type GooglePlacesAddressInputProps = {
  onAddressSelect: (address: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  required?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
};

export function GooglePlacesAddressInput({
  onAddressSelect,
  placeholder = "Search for an address...",
  className,
  defaultValue = "",
  required = false,
  onFocus,
}: GooglePlacesAddressInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [apiError, setApiError] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    loadGoogleMapsScript()
      .then(() => {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        setIsApiLoading(false);
      })
      .catch(() => {
        setApiError(true);
        setIsApiLoading(false);
        setIsManualMode(true);
      });
  }, []);
  
  useEffect(() => {
    if (defaultValue !== inputValue) {
      setInputValue(defaultValue);
    }
  }, [defaultValue]);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const searchAddresses = useCallback((query: string) => {
    if (!autocompleteServiceRef.current || query.length < 2) {
      setPredictions([]);
      setSearchError(null);
      return;
    }

    setIsLoading(true);
    setSearchError(null);

    autocompleteServiceRef.current.getPlacePredictions(
      {
        input: query,
        types: ['geocode'],
      },
      (results, status) => {
        setIsLoading(false);
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results);
          setShowDropdown(true);
          setSearchError(null);
        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          setPredictions([]);
          setShowDropdown(false);
          setSearchError(null);
        } else if (status === window.google.maps.places.PlacesServiceStatus.INVALID_REQUEST) {
          setPredictions([]);
          setSearchError('Invalid search query. Please try again.');
        } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
          setPredictions([]);
          setSearchError('Search limit reached. Please wait a moment and try again.');
        } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
          setPredictions([]);
          setSearchError('Search service unavailable. Please enter manually.');
        } else {
          setPredictions([]);
          setSearchError('Could not search. Please try again.');
        }
      }
    );
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchError(null);

    if (isManualMode) {
      onAddressSelect(value);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchAddresses(value);
    }, 300);
  };
  
  const handleSelectAddress = (prediction: google.maps.places.AutocompletePrediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    onAddressSelect(prediction.description);
  };
  
  const handleEnableManualMode = () => {
    setIsManualMode(true);
    setShowDropdown(false);
    setPredictions([]);
    onAddressSelect(inputValue);
  };
  
  const handleDisableManualMode = () => {
    setIsManualMode(false);
    if (inputValue.length >= 2) {
      searchAddresses(inputValue);
    }
  };
  
  if (isApiLoading) {
    return (
      <div className={cn("relative", className)}>
        <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading search...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={isManualMode ? "Enter address..." : placeholder}
          className={cn("pr-20", className)}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={(e) => {
            onFocus?.(e);
            if (!isManualMode && inputValue.length >= 2 && predictions.length > 0) {
              setShowDropdown(true);
            }
          }}
          required={required}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {!isLoading && !isManualMode && <MapPin className="h-4 w-4 text-muted-foreground" />}
          {isManualMode && !apiError && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={handleDisableManualMode}
            >
              Search
            </Button>
          )}
        </div>
      </div>

      {searchError && !isManualMode && (
        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{searchError}</p>
          <button
            type="button"
            onClick={handleEnableManualMode}
            className="text-xs text-destructive underline mt-2 hover:no-underline"
          >
            Try entering manually
          </button>
        </div>
      )}

      {showDropdown && predictions.length > 0 && !isManualMode && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
              onClick={() => handleSelectAddress(prediction)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm truncate">{prediction.description}</div>
              </div>
            </button>
          ))}
          <button
            type="button"
            className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors text-sm text-muted-foreground flex items-center gap-2"
            onClick={handleEnableManualMode}
          >
            <Pencil className="h-4 w-4" />
            <span>Can't find it? Enter manually</span>
          </button>
        </div>
      )}
      
      {isManualMode && (
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Pencil className="h-3 w-3" />
          Manual entry mode - type the address directly
        </p>
      )}
    </div>
  );
}
