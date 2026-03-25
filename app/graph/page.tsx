"use client";
//  ======== MUI ==============
import { RadarChart } from "@mui/x-charts";
//  ======== MUI ==============
// ======== React ==============
// ======== React ==============
interface dataprops {
  dataSelect: string;
}

export default function BasicRadar({ dataSelect }: dataprops) {
  if (dataSelect === null) return <div></div>;
  else {
    const dataParse =
      typeof dataSelect === "string" ? JSON.parse(dataSelect) : dataSelect;
    const getChartData = (data: any) => {
      if (!data) return [0, 0, 0];
      else if (Array.isArray(data)) {
        //plane
        return [
          Number(data[6]) ?? 0, //lat
          Number(data[5]) ?? 0, //lon
          Number(data[9]) ?? 0, //speed
          Number(data[7]) ?? 0, //heigh
          data[1] || "", //name,
          "#00BFFF", //color
        ];
      } else if (data.instrument === "VIIRS") {
        //fire
        return [
          Number(parseFloat(data?.latitude)) ?? 0,
          Number(parseFloat(data?.longitude)) ?? 0,
          Number(parseFloat(data?.frp)) ?? 0, //power
          Number(parseFloat(data?.frp) * 100) ?? 0, //heigh
          data?.instrument, //name
          "#FF0000", //color
        ];
      } else if (data.Message) {
        //boat

        const message = data.Message;
        const firstKey = message ? Object.keys(message)[0] : null;
        const sog = firstKey ? message[firstKey]?.Sog : 0;
        return [
          Number(data?.MetaData?.latitude) ?? 0,
          Number(data.MetaData?.longitude) ?? 0,
          Number(sog) || 0, //speed
          0, //heigh
          data.MetaData.ShipName, //name
          "#E0FFFF",
        ];
      } else if (Array.isArray(data.geometry)) {
        //volcanoes
        return [
          data.geometry?.[0].coordinates?.[0] || 0,
          data.geometry?.[0].coordinates?.[1] || 0,
          data.geometry?.[0]?.magnitudeValue || 0, //power
          0,
          data?.title, //name
          "#8B0000", //color
        ];
      } else if (data.geometry) {
        //earthquake
        return [
          Number(data.geometry?.coordinates?.[0]),
          Number(data.geometry?.coordinates?.[1]),
          Number(data?.properties?.mag),
          0,
          data?.properties?.place, //name
          "#FFA500", //color
        ];
      } else if (data.line1) {
        //earthquake
        return [
          0,
          0,
          27600,
          410,
          "ISS", //name
          "#EAEAEA", //color
        ];
      }

      return [0, 0, 0, 0, " ", "white"];
    };
    const formattedData = getChartData(dataParse);
    return (
      <div
        className={`bg-gray-700 group px-2 text-white  font-bold  pt-4 w-80 h-screen flex flex-col   items-center transition-all duration-400 ease-in-out `}
      >
        {
          //<h4>{dataSelect}</h4>
        }
        <RadarChart
          sx={{
            color: "white !important",
            "& .MuiChartsAxis-tickLabel tspan": {
              fill: "white !important",
            },
            // '& .MuiChartsLegend-root text':{
            //   fill:"white !important"
            // },
            "& svg text": {
              fill: "white !important",
            },
            "& .MuiChartsLegend-label tspan": {
              fill: "white !important",
              dominantBaseline: "central",
            },
            "& text": {
              fill: "white !important",
            },
            // colorScheme="dark"
          }}
          height={200}
          colors={["#FFFFFF"]}
          series={[
            {
              label: formattedData[4],
              data: [
                formattedData[0],
                formattedData[1],
                formattedData[2],
                formattedData[3],
              ],
              color: formattedData[5],
            },
          ]}
          radar={{
            max: 120,

            metrics: ["lat", "lon", "speed / power", "heigh"],
          }}
        />
      </div>
    );
  }
}
