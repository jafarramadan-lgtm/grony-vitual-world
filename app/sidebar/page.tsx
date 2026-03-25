"use client";
//  ======== MUI ==============
import SailingIcon from "@mui/icons-material/Sailing";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import HardwareIcon from "@mui/icons-material/Hardware";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import VolcanoIcon from '@mui/icons-material/Volcano';
//  ======== MUI ==============
//  ======== React ==============
import { useState,useRef ,useEffect} from "react";
//  ======== React ==============
import axios from "axios";

interface dataprops{
  
  setdata:(data:any)=>void;
   setimg:(data:any)=>void;
}
export default function SideBar({setdata,setimg}:dataprops) {
  const interval=useRef<ReturnType<typeof setInterval>|null>(null);
  const [selected, setSelected] = useState<string>("");
  function handleSelect(choose: string) {
    setSelected(choose);
  }
    const fetchdata = () => {
      axios
        .get(`https://virtual-world-1.onrender.com/${selected}`)
        .then(function (response) {
          setdata(response.data);
          console.log(response.data,selected);
        })
        .catch(function (error) {
          console.log(error);
        });
    };
useEffect(()=>{
  setdata([]);
if(selected==="boat"||selected==="plane"||selected==="fire"||selected==="earthquake"||selected==="volcanoes"){
  fetchdata();
  interval.current=setInterval(fetchdata,10000)
}else{
console.log("jafar");
interval.current=null;

}
return ()=>{if (interval.current){clearInterval(interval.current)}}
},[selected])
  return (
    <div className="bg-gray-700 group px-2  pt-4 w-14 h-screen flex flex-col hover:w-80 gap-10 items-center   transition-all duration-400 ease-in-out ">
      <h2 className="w-full flex  flex-col items-center  ">
        Choos <hr className="w-full" />
      </h2>
      <RadioGroup
        aria-labelledby="demo-radio-buttons-group-label"
        name="radio-buttons-group"
        // defaultValue={"Earthquake"}
      >
        <div className="flex  ">
          <SailingIcon className="text-white m-2" />

          <div className="hidden group-hover:block ">
            <FormControlLabel
              control={
                <Radio
                  onChange={(e) => {
                    if(e.target.checked){
                      handleSelect("boat") ;
                      setimg("boat")
                    }
                    }}
                />
              }
              value="boat"
              label="Boat"
            />
            <hr className="w-full" />
          </div>
        </div>
        <div className="flex  ">
          <WhatshotIcon className="text-white m-2" />
          <div className="hidden group-hover:block ">
            <FormControlLabel
              control={
                <Radio
                  onChange={(e) => {
                  if(  e.target.checked ) {handleSelect("fire");setimg("fire");} ;
                  }}
                />
              }
              value="Fire"
              label="Fire"
            />
            <hr className="w-full" />
          </div>
        </div>
        <div className="flex  ">
          <AirplanemodeActiveIcon className="text-white m-2" />
          <div className="hidden group-hover:block ">
            <FormControlLabel
              control={
                <Radio
                  onChange={(e) => {
                    if(e.target.checked ){handleSelect("plane");setimg("plane")} ;
                  }}
                />
              }
              label="Plane"
              value="Plane"
            />
            <hr className="w-full" />
          </div>
        </div>
        <div className="flex  ">
          <HardwareIcon className="text-white m-2" />
          <div className="hidden group-hover:block ">
            <FormControlLabel
              control={
                <Radio
                  onChange={(e) => {
                   if( e.target.checked)
                      {handleSelect("earthquake");setimg("earthquake")}
                  
                  }}
                />
              }
              value="Earthquake"
              label="Earthquake"
            />
            <hr className="w-full" />
          </div>
        </div>
         <div className="flex  ">
          <VolcanoIcon className="text-white m-2" />
          <div className="hidden group-hover:block ">
            <FormControlLabel
              control={
                <Radio
                  onChange={(e) => {
                   if( e.target.checked)
                      {handleSelect("volcanoes");setimg("volcanoes")}
                  
                  }}
                />
              }
              value="Volcanoes"
              label="Volcanoes"
            />
            <hr className="w-full" />
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}
