const solarAPI = "https://api.le-systeme-solaire.net/rest/bodies/";

var planets = [];

const getData = async () => {
  // async function, always returns promise
  const response = await fetch(solarAPI);
  const data = await response.json();

  // must use .then when returning
  return data;
};

getData()
  .then((data) => {
    //console.log("resolved", data);
    var solarDATA = data.bodies;
    // orbitalConversion(solar_data[0]);

    for (let i = 0; i < solarDATA.length; i++) {
      if (solarDATA[i].isPlanet === true) {
        var temp = orbitalConversion(solarDATA[i]);
        let comp = {
          x: temp[0],
          y: temp[1],
          z: temp[2],
        };
        planets = { ...solarDATA[i], ...comp };
      }
    }
    console.log(planets[8]);
  })
  .catch((err) => {
    console.log("rejected", err);
  });

/* fetch(solar_api)
  .then((response) => {
    // resolve
    console.log("resolved", response);
    return response.json(); // parses response data -> returns promise
  })
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    // reject
    // only rejected when offline/network error
    console.log("rejected", err);
  }); */

function orbitalConversion(orbitalElements) {
  /*
  Takes in Kepler orbital elements and calculates cartesian.
  Accepts any object which contans the following parameters:
  - semimajorAxis (a)
  - eccentricity (e)
  - inclination (i)
  - mainAnomaly (Mo)
  - argPeriapsis (omega)
  - longAscNode (Omega)
  */

  const kmPerAU = 1.496e8;

  var orbitalDistance = null;

  var primaryOrbitalElements = {
    semimajorAxis_AU: orbitalElements.semimajorAxis / kmPerAU,
    eccentricity: orbitalElements.eccentricity,
    inclination: orbitalElements.inclination,
    meanAnomaly: orbitalElements.mainAnomaly,
    argumentPeriapsis: orbitalElements.argPeriapsis,
    longitudeAscendingNode: orbitalElements.longAscNode,
  };

  // relatedOrbitalElements
  let longitudePerihelion =
    primaryOrbitalElements.longitudeAscendingNode +
    primaryOrbitalElements.argumentPeriapsis;
  let meanLongitude = primaryOrbitalElements.meanAnomaly + longitudePerihelion;
  let perihelionDistance =
    primaryOrbitalElements.semimajorAxis_AU *
    (1 - primaryOrbitalElements.eccentricity);
  let aphelionDistance =
    primaryOrbitalElements.semimajorAxis_AU *
    (1 + primaryOrbitalElements.eccentricity);
  let orbitalPeriod = Math.pow(primaryOrbitalElements.semimajorAxis_AU, 1.5);
  let epochMeanAnomaly =
    primaryOrbitalElements.meanAnomaly / 360 / orbitalPeriod;
  let trueAnomaly = null;
  let eccentricAnomaly = null;

  var kep = {
    /*
    List of orbital elements assigned variable names matching the
    naming conventions used for them. Uused to simplify calcs.
    */
    N: primaryOrbitalElements.longitudeAscendingNode,
    i: primaryOrbitalElements.inclination,
    w: primaryOrbitalElements.argumentPeriapsis,
    a: primaryOrbitalElements.semimajorAxis_AU,
    e: primaryOrbitalElements.eccentricity,
    M: primaryOrbitalElements.meanAnomaly,
    w1: longitudePerihelion,
    L: meanLongitude,
    q: perihelionDistance,
    Q: aphelionDistance,
    P: orbitalPeriod,
    T: epochMeanAnomaly,
    V: trueAnomaly,
    E: eccentricAnomaly,
    r: orbitalDistance,
  };

  kep.E = calculateEccentricAnomaly(kep.M, kep.e);
  [kep.V, kep.r] = calculateTrueAnomaly(kep.E, kep.e, kep.a);

  //console.log(kep);

  let xh =
    kep.r *
    (Math.cos(kep.N) * Math.cos(kep.V + kep.w) -
      Math.sin(kep.N) * Math.sin(kep.V + kep.w) * Math.cos(kep.i));
  let yh =
    kep.r *
    (Math.sin(kep.N) * Math.cos(kep.V + kep.w) +
      Math.cos(kep.N) * Math.sin(kep.V + kep.w) * Math.cos(kep.i));
  let zh = kep.r * (Math.sin(kep.V + kep.w) * Math.sin(kep.i));

  return [xh, yh, zh];
}

function calculateTrueAnomaly(E, e, a) {
  let xTrueAnomaly = a * (Math.cos(E) - e);
  let yTrueAnomaly = a * (Math.sqrt(1.0 - Math.pow(e, 2)) * Math.sin(E));

  return [
    Math.atan2(xTrueAnomaly, yTrueAnomaly),
    Math.sqrt(Math.pow(xTrueAnomaly, 2), Math.pow(yTrueAnomaly, 2)),
  ];
}

function calculateEccentricAnomaly(M, e) {
  const INDEX_LIMIT = 5000;
  const CONVERGING_THRESHOLD = 1e-5;

  if (e <= 0.05) {
    // simplified E for low eccentricity
    return M * e * Math.sin(M) * (1 + e * Math.cos(M));
  } else if ((e > 0.05) & (e < 1)) {
    let difference = 1;
    let E0 = M * e * (Math.PI / 180) * Math.sin(M) * (1 + e * Math.cos(M));
    let E1 = null;
    while (Math.abs(difference) > CONVERGING_THRESHOLD) {
      let index = 0;
      E1 =
        E0 -
        (E0 - e * (Math.PI / 180) * Math.sin(E0) - M) / (1 - e * Math.cos(E0));
      difference = E1 - E0;
      E0 = E1;
      if (index > INDEX_LIMIT) {
        // need to find nicer way to deal with non-convergence of eccentric anomoly
        throw new Error("Unable to resolve eccentric anomaly");
      }
    }
    return E1;
  } else if (e >= 1) {
    // required implimentation for near-parabolic and parabolic orbits
    return null;
  } else {
    throw new Error("Unexpected orbital eccentricity");
  }
}

export default planets;
