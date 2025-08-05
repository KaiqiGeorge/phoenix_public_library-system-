import React from "react";
import "./HomePage.css";

const libraries = [

  {
    name: "Acacia Library",
    image: "/images/libraries/acacia.jpeg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Acacia",
    address: "750 E Townley Ave, Phoenix, AZ 85020",
    hours: "Mon: 9 am–5 pm; Tue–Thu: 10 am–6 pm; Fri–Sat: 9 am–5 pm"
  },
  {
    name: "Agave Library",
    image: "/images/libraries/agave.webp",
    website: "https://www.phoenixpubliclibrary.org/Locations/Agave",
    address: "23550 N 36th Ave, Phoenix, AZ 85310",
    hours: "Mon–Sat: 9 am–5 pm"
  },
    {
    name: "Burton Barr Central Library",
    image: "/images/libraries/burton.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Burton-Barr",
    address: "1221 North Central Ave, Phoenix, AZ 85004",
    hours: "Mon–Sat: 9 am–9 pm, Sun: 1 pm–5 pm"
  },
  {
    name: "Century Library",
    image: "/images/libraries/century.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Century",
    address: "1750 E Highland Ave, Phoenix, AZ 85016",
    hours: "Mon–Sat: 9 am–5 pm; Sun: Closed"
  },
  {
    name: "Cesar Chavez Library",
    image: "/images/libraries/cesar.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/CesarChavez",
    address: "3635 W Baseline Rd, Phoenix, AZ 85339",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Cholla Library",
    image: "/images/libraries/cholla.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Cholla",
    address: "10050 Metro Pkwy E, Phoenix, AZ 85051",
    hours: "Mon–Tue: 9 am–5 pm; Wed–Thu: 9 am–6 pm; Fri–Sat: 9 am–5 pm"
  },
  {
    name: "Desert Broom Library",
    image: "/images/libraries/desertbroom.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/DesertBroom",
    address: "29710 N Cave Creek Rd, Phoenix, AZ 85031",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Desert Sage Library",
    image: "/images/libraries/desertsage.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/DesertSage",
    address: "7602 W Encanto Blvd, Phoenix, AZ 85035",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Harmon Library",
    image: "/images/libraries/harmon.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Harmon",
    address: "1325 S 5th Ave, Phoenix, AZ 85003",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Ironwood Library",
    image: "/images/libraries/ironwood.webp",
    website: "https://www.phoenixpubliclibrary.org/Locations/Ironwood",
    address: "4333 E Chandler Blvd, Phoenix, AZ 85048",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Juniper Library",
    image: "/images/libraries/juniper.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Juniper",
    address: "1825 W Union Hills Dr, Phoenix, AZ 85027",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Mesquite Library",
    image: "/images/libraries/mesquite.webp",
    website: "https://www.phoenixpubliclibrary.org/Locations/Mesquite",
    address: "4525 E Paradise Village Pkwy N, Phoenix, AZ 85032",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Ocotillo Library & Workforce Literacy Center",
    image: "/images/libraries/ocotillo.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Ocotillo",
    address: "102 W Southern Ave, Phoenix, AZ 85041",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Palo Verde Library",
    image: "/images/libraries/paloverde.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/PaloVerde",
    address: "4402 N 51st Ave, Phoenix, AZ 85031",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Saguaro Library",
    image: "/images/libraries/saguaro.jpg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Saguaro",
    address: "2808 N 46th St, Phoenix, AZ 85008",
    hours: "Mon–Sat: 9 am–5 pm"
  },
  {
    name: "Yucca Library",
    image: "/images/libraries/yucca.jpeg",
    website: "https://www.phoenixpubliclibrary.org/Locations/Yucca",
    address: "5648 N 15th Ave, Phoenix, AZ 85015",
    hours: "Mon–Sat: 9 am–5 pm"
  }
];


function HomePage() {
  return (
    <div className="homePage">
      <section className="intro-section">
        <h1 className="display-5 fw-bold">Welcome to the Phoenix Public Library System</h1>
        <p className="lead">
          Discover a network of libraries offering books, media, community
          programs, and free resources across the city of Phoenix.
        </p>
      </section>
      <section className="library-cards">
        {libraries.map((library, index) => (
          <div className="card shadow-sm library-card" key={index}>
            <img
              src={library.image}
              className="card-img-top"
              alt={library.name}
            />
            <div className="card-body">
              <h5 className="card-title mb-3 ms-1">
                <a
                  href={library.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {library.name}
                </a>
              </h5>
              <p className="card-text mb-1">📍{library.address}</p>
               <p className="card-text">🕙 {library.hours}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
export default HomePage;