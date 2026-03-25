from typing import List


def generate_mock_itinerary(destination: str, days: int, interests: List[str]) -> list[dict]:
    normalized_interests = interests or ["sightseeing", "local food", "relaxation"]
    itinerary = []
    for day in range(1, days + 1):
        focus = normalized_interests[(day - 1) % len(normalized_interests)]
        itinerary.append(
            {
                "day": day,
                "items": [
                    {
                        "time": "09:00",
                        "location": f"{destination} city center",
                        "description": f"Morning exploration focused on {focus}.",
                    },
                    {
                        "time": "13:00",
                        "location": f"{destination} local district",
                        "description": "Lunch break and neighborhood walk.",
                    },
                    {
                        "time": "18:00",
                        "location": f"{destination} landmark area",
                        "description": "Evening activity and photo moments.",
                    },
                ],
            }
        )
    return itinerary
