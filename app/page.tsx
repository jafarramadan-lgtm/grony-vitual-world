"use client"
import SideBar from "./sidebar/page";
import ShipMap from "./map/page";
import BasicRadar from "./graph/page";
import {useState} from "react";
export default function Home() {
const [data, setdata] = useState<
    {
      MetaData: {
        latitude: number | string;
        longitude: number | string;
        ShipName: string;
      };
    }[]|[]
  >([]);
const [img,setimg]=useState("")
const [dataSelect,setDataSelect]=useState(null)

  return (
    <div className="flex min-h-screen items-center justify-center  font-sans bg-gray-100">
      <SideBar   setimg={setimg}   setdata={setdata}/>
      <ShipMap  img={img}   data={data}   setDataSelect={setDataSelect}/>
     <BasicRadar dataSelect={dataSelect}/>
    </div>
  );
}
