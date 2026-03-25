"use client";
import * as satellite from "satellite.js";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import { useEffect, useRef, useState } from "react";
try{
  (window as unknown as { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = "/Cesium";

}
catch(e){
  console.log(e)
}
interface dataprops {
  data:
    | {
        MetaData: {
          latitude: number | string;
          longitude: number | string;
          ShipName: string;
        };
      }[]
    | [];
   img: string;
   setDataSelect: (data: any) => void;
}
export default function ShipMap({
  data,
   img,
   setDataSelect,
}: dataprops) {
  const billboardRef = useRef<Cesium.BillboardCollection | null>(null);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const boatRef = useRef<Map<string, Cesium.Billboard>>(new Map());
  const issPositionProperty = useRef(
    new Cesium.SampledPositionProperty(),
  ).current;
  issPositionProperty.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
  const issPositionPropertyStarlink = useRef(
    new Cesium.SampledPositionProperty(),
  ).current;
  issPositionPropertyStarlink.forwardExtrapolationType =
    Cesium.ExtrapolationType.HOLD;
  useEffect(() => {
    if (!viewerRef.current) {
      Cesium.Ion.defaultAccessToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0ZDRjOTgxYS0yNDlhLTQ5YWYtOTQ3OS0yNWQ5Njc2Mjg5YWQiLCJpZCI6Mzk5OTc0LCJpYXQiOjE3NzI5MTk4MDl9.toikwLnqlch0g2jYxMqqQYxrXesAwmj77491Zc4LLCs";

      const viewr = new Cesium.Viewer("cesiumContainer", {
        terrain: Cesium.Terrain.fromWorldTerrain(),
        baseLayerPicker: true,
        shouldAnimate: true, // ضروري جداً لتشغيل محرك الحركة
      });
      const handler = new Cesium.ScreenSpaceEventHandler(viewr.scene.canvas);
      handler.setInputAction((movment: any) => {
        const pick = viewr.scene.pick(movment.position);
         if (Cesium.defined(pick) && pick.primitive) {
          setDataSelect(pick?.id?.id || pick?.id || pick?.id?._id);
         } else {
          setDataSelect(null);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      const issEntity = viewr.entities as any;

      const fetchsatelliteData = async () => {
        try {
          const response = await fetch(
            "https://tle.ivanstanojevic.me/api/tle/25544",
          );
          if (!response.ok) throw new Error("Network repomse was not ok");
          const data = await response.json();
          const updatePositionSSI = () => {
            const tleLine1 = data.line1;
            const tleLine2 = data.line2;
            const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
            const now = Cesium.JulianDate.toDate(viewr.clock.currentTime);
            const positionAndVelocity = satellite.propagate(satrec, now);
            const positionEce = positionAndVelocity?.position;
            if (positionEce) {
              const gmst = satellite.gstime(now);
              const positiongd = satellite.eciToGeodetic(positionEce, gmst);
              const position = Cesium.Cartesian3.fromRadians(
                positiongd.longitude,
                positiongd.latitude,
                positiongd.height * 1000,
              );
              const time = Cesium.JulianDate.fromDate(now);
              issPositionProperty.addSample(time, position);
            }
          };
          updatePositionSSI();
          viewr.clock.onTick.addEventListener(() => {
            updatePositionSSI();
          });
          const actualSS = viewr.entities.add({
            id: JSON.stringify(data),
            position: issPositionProperty,
            model: {
              uri: "/ISS_stationary.glb",
              minimumPixelSize: 128,
              maximumScale: 20000,
            },
            label: {
              text: "ISS-Live",
              font: "10pt sans-serif",
              pixelOffset: new Cesium.Cartesian2(0, -20),
            },

            path: {
              resolution: 1,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.1,
                color: Cesium.Color.CYAN,
              }),
              width: 5,
              leadTime: 5400,
              trailTime: 5400,
            },
          });
        } catch (error) {
          console.log(error);
        }
      };
      fetchsatelliteData();
      const fetchsatelliteDataStarlink = async () => {
        try {
          const response = await fetch(
            "https://celestrak.org/NORAD/elements/gp.php?GROUP=starlink&FORMAT=tle",
          );
          if (!response.ok) throw new Error("Network repomse was not ok");

          const text = await response.text();
          const lines = text.split("\n").filter((line) => line.trim() !== "");
          const satellites: any = [];
          for (let i = 0; i < 720; i += 3) {
            const name = lines[i];
            const line1 = lines[i + 1];
            const line2 = lines[i + 2];
            if (line1 && line2) {
              const strec = satellite.twoline2satrec(line1, line2);
              satellites.push({ name, strec });
            }
          }
          const en = satellites.map((sat: any) => {
             return viewr.entities.add({
              name: sat.name,
              id:JSON.stringify(sat.name),
              position: new Cesium.SampledPositionProperty(),
              point: {
                pixelSize: 4,
                color: Cesium.Color.CYAN,
              },
                    
              
            });
          });
          const updatePositionstarlink = () => {
            const now = Cesium.JulianDate.toDate(viewr.clock.currentTime);
            satellites.forEach((sat: any, index: any) => {
              const entitity = en[index];
              const pv = satellite.propagate(sat.strec, now);
              const positionEce = pv?.position;

              if (positionEce) {
                const gmst = satellite.gstime(now);
                const positiongd = satellite.eciToGeodetic(positionEce, gmst);
                const position = Cesium.Cartesian3.fromRadians(
                  positiongd.longitude,
                  positiongd.latitude,
                  positiongd.height * 1000,
                );
                entitity.position = position;
              }
            });
          };
          updatePositionstarlink();
          viewr.clock.onTick.addEventListener(() => {
            updatePositionstarlink();
          });
        } catch (error) {
          console.log(error);
        }
      };
      fetchsatelliteDataStarlink();

      const moon = new Cesium.Moon();

      viewr.scene.moon = moon;
      viewr.scene.moon.show = true;
      // viewr.scene.moon.glowFactor = 10.0;
      viewr.scene.skyAtmosphere = new Cesium.SkyAtmosphere();
      viewr.scene.skyAtmosphere.show = true;
      viewr.scene.globe.showGroundAtmosphere = true;
      viewr.scene.globe.enableLighting = true;
      viewr.scene.postProcessStages.bloom.enabled = true;
      const bloom = viewr.scene.postProcessStages.bloom;
      bloom.uniforms.contrast = 120.0;
      bloom.uniforms.brightness = -3.0;
      bloom.uniforms.glowOnly = false;
      viewr.scene.sun = new Cesium.Sun();
      viewr.scene.sun.show = true;

      viewr.scene.sun.glowFactor = 5.0;
      // viewr.camera.flyTo({destination:viewr.scene.moon.ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(0,0,400000000))})
      const addNightlight = async () => {
        try {
          const nightlightsprovider =
            await Cesium.IonImageryProvider.fromAssetId(3812);
          const nightlayer =
            viewr.imageryLayers.addImageryProvider(nightlightsprovider);
          nightlayer.dayAlpha = 0.0;
          nightlayer.nightAlpha = 1.0;
          nightlayer.brightness = 4.5;
          nightlayer.contrast = 3.0;
          viewr.imageryLayers.raiseToTop(nightlayer);
        } catch (error) {
          console.log(error);
        }
      };
      addNightlight();
      const now = Cesium.JulianDate.now();
      viewr.clock.currentTime = Cesium.JulianDate.addSeconds(
        now,
        -10,
        new Cesium.JulianDate(),
      );
      // -------------------------------
      viewerRef.current = viewr;
      billboardRef.current = viewr.scene.primitives.add(
        new Cesium.BillboardCollection(),
      );
    }
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // 3. رسم وتحديث الطائرات
  useEffect(() => {
    const billboards = billboardRef.current;
    if (!billboards) return;
    // billboards.removeAll();
    if (data.length === 0) {
      billboards.removeAll();
      boatRef.current.clear();
      return;
    }else
    data.forEach((i: any) => {
      if (
        (!i?.MetaData?.latitude &&
          !i?.[5] &&
          !i?.latitude &&
          !i.geometry?.coordinates?.[0] &&
          !i.geometry?.[0]?.coordinates?.[0]) ||
        (!i?.MetaData?.longitude &&
          !i?.[6] &&
          !i?.longitude &&
          !i.geometry?.coordinates?.[1] &&
          !i.geometry?.[0]?.coordinates?.[1])
      )
        return;
      const name =
        i?.MetaData?.ShipName ||
        i?.[1] ||
        i?.latitude ||
        i?.properties?.ids ||
        i?.id ||
        "unknown";
      const longitude = Number(
        i.MetaData?.longitude ??
          i?.longitude ??
          i?.[5] ??
          i?.geometry?.coordinates?.[0] ??
          i?.geometry?.[0]?.coordinates?.[0],
      );
      const latitude = Number(
        i.MetaData?.latitude ??
          i?.latitude ??
          i?.[6] ??
          i?.geometry?.coordinates?.[1] ??
          i?.geometry?.[0]?.coordinates?.[1],
      );
      const position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
      let boatBillboard = boatRef.current.get(name);
      if (!boatBillboard) {
        boatBillboard = billboards.add({
          id: JSON.stringify(i),
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
          image: `/${img}.png`,
          width: 30,
          height: 30,
        });
        boatRef.current.set(name, boatBillboard);
      } else {
        boatBillboard.position = position;
      }
    });
  }, [data]);

  return (
    <div id="cesiumContainer" style={{ width: "100vw", height: "100vh" }} />
  );
}
