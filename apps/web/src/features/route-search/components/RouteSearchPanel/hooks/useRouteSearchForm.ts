import { useCallback, useState, type KeyboardEvent } from "react";
import type { RouteSearchRequest } from "@catch-it/core";

export function useRouteSearchForm(
  onSubmit: (request: RouteSearchRequest) => void,
) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("");

  const canSubmit = origin.trim() !== "" && destination.trim() !== "";

  const submit = useCallback(() => {
    if (!canSubmit) return;

    onSubmit({
      origin: origin.trim(),
      destination: destination.trim(),
      ...(departure ? { time: departure } : {}),
    });
  }, [canSubmit, departure, destination, onSubmit, origin]);

  const submitOnEnter = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      submit();
    },
    [submit],
  );

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    departure,
    setDeparture,
    canSubmit,
    submit,
    submitOnEnter,
  };
}
