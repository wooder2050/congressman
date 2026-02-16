import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type {
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon,
} from "geojson";

export interface DistrictProperties {
  SGG_Code: string;
  SIDO_SGG: string;
  SIDO: string;
  SGG: string;
}

export interface ProvinceProperties {
  SIDO: string;
}

/**
 * d3-geo는 구면(spherical) 와인딩 규칙을 사용하여
 * GeoJSON RFC 7946 (CCW exterior)과 반대.
 * 이 함수로 링의 방향을 뒤집어 d3-geo 호환으로 만듦.
 */
function reverseRings<P>(fc: FeatureCollection<Geometry, P>): FeatureCollection<Geometry, P> {
  return {
    ...fc,
    features: fc.features.map((f) => ({
      ...f,
      geometry: reverseGeometryRings(f.geometry),
    })),
  };
}

function reverseGeometryRings(geom: Geometry): Geometry {
  if (geom.type === "Polygon") {
    return {
      ...geom,
      coordinates: (geom as Polygon).coordinates.map((ring) => [...ring].reverse()),
    } as Polygon;
  }
  if (geom.type === "MultiPolygon") {
    return {
      ...geom,
      coordinates: (geom as MultiPolygon).coordinates.map((polygon) =>
        polygon.map((ring) => [...ring].reverse()),
      ),
    } as MultiPolygon;
  }
  return geom;
}

let districtCache: FeatureCollection<Geometry, DistrictProperties> | null =
  null;
let provinceCache: FeatureCollection<Geometry, ProvinceProperties> | null =
  null;

export async function loadDistricts(): Promise<
  FeatureCollection<Geometry, DistrictProperties>
> {
  if (districtCache) return districtCache;
  const res = await fetch("/geo/districts.topo.json");
  const topo: Topology = await res.json();
  const objectName = Object.keys(topo.objects)[0];
  const fc = feature(
    topo,
    topo.objects[objectName] as GeometryCollection<DistrictProperties>,
  ) as FeatureCollection<Geometry, DistrictProperties>;
  districtCache = reverseRings(fc);
  return districtCache;
}

export async function loadProvinces(): Promise<
  FeatureCollection<Geometry, ProvinceProperties>
> {
  if (provinceCache) return provinceCache;
  const res = await fetch("/geo/provinces.topo.json");
  const topo: Topology = await res.json();
  const objectName = Object.keys(topo.objects)[0];
  const fc = feature(
    topo,
    topo.objects[objectName] as GeometryCollection<ProvinceProperties>,
  ) as FeatureCollection<Geometry, ProvinceProperties>;
  provinceCache = reverseRings(fc);
  return provinceCache;
}

/** 시도별로 선거구 필터링 */
export function filterDistrictsBySido(
  districts: FeatureCollection<Geometry, DistrictProperties>,
  sido: string,
): FeatureCollection<Geometry, DistrictProperties> {
  return {
    type: "FeatureCollection",
    features: districts.features.filter((f) => f.properties.SIDO === sido),
  };
}
