"use client";

import { useEffect, useRef, useState } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

let googleScriptLoaded = false;
let googleScriptLoading = false;
const callbacks: (() => void)[] = [];

function loadGoogleScript(apiKey: string) {
  if (googleScriptLoaded) return Promise.resolve();
  if (googleScriptLoading) {
    return new Promise<void>((resolve) => {
      callbacks.push(resolve);
    });
  }

  googleScriptLoading = true;
  return new Promise<void>((resolve) => {
    callbacks.push(resolve);
    window.initGooglePlaces = () => {
      googleScriptLoaded = true;
      googleScriptLoading = false;
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  });
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Property Address",
  required = false,
  className = "",
  id,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    loadGoogleScript(apiKey).then(() => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "us" },
        fields: ["formatted_address", "address_components"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place?.formatted_address) {
        onChange(place.formatted_address);
      }
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
        autocompleteRef.current = null;
      }
    };
  }, [ready]);

  const defaultClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-brand focus:ring-2 focus:ring-green-brand/20 focus:outline-none";

  return (
    <input
      ref={inputRef}
      type="text"
      id={id}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className || defaultClass}
    />
  );
}
