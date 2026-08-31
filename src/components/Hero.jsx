const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__graphic">
        <img
          src="././momentum_secondary_favicon.png"
          alt="A newton's cradle with three balls and blue and green accent colors."
        />
      </div>

      <h1 className="hero__headline">
        Log your workouts. Watch your progress build.
      </h1>
      <p className="hero__subtext">
        One place to track every set, session, and stat — so momentum keeps
        moving forward.
      </p>
    </section>
  );
};

export default Hero;
