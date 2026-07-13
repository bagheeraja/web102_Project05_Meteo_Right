import { useParams, useSearchParams } from "react-router-dom";

function DayDetail() {
    const { date } = useParams();
    const [searchParams] = useSearchParams();

    const latitude = parseFloat(searchParams.get("lat"));
    const longitude = parseFloat(searchParams.get("lon"));
    const locationName = searchParams.get("name");

    return (
    <div>
        <h1>Day detail for: {date}</h1>
        <p>{locationName} · {latitude}, {longitude}</p>
    </div>
    )
}

export default DayDetail;