import { FC } from "react";

const KOAPetFriendly: FC = () => {
  return (
    <div className="bg-mintGreen py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-lexend">
              We Cater To Camping with Pets
            </h2>
            <p className="text-lg text-white/90 mb-6 font-sans">
              KOA makes traveling with your four-legged family members easy and fun. Our KampK9® pet parks provide a fenced area 
              where your pup has room to roam off leash and ample seating for you to watch them romp while you are camping. 
              You'll find cleanup stations, fresh water and, at some KOAs, dedicated areas for large and small dogs. 
              KampK9 pet parks get pawsitive reviews all around!
            </p>
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-bold text-white mb-2 font-lexend">
                KOA Paw Pen℠ Sites
              </h3>
              <p className="text-white/90 font-sans">
                Campgrounds are starting to introduce KOA Paw Pen℠ Sites. This unique amenity features a private, fenced in area 
                that is part of your purchased site - allowing you to relax and interact with your pet without needing them to be 
                on a chain or a leash!
              </p>
            </div>
            <a
              href="/articles?topic=pet_friendly"
              className="inline-block bg-white text-darkGreen px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors uppercase font-lexend"
            >
              Find Pet-Friendly Campgrounds
            </a>
          </div>
          <div className="flex justify-center">
            <div className="bg-white/20 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🐕</div>
              <p className="text-white font-semibold text-lg font-lexend">
                KampK9® Pet Parks
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KOAPetFriendly;

