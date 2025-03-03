function ProfileCircle() {
  const imageUrl = "/assets/userprofile-test.jpg";

  return (
    <div
      className="w-8 h-8 rounded-full overflow-hidden cursor-pointer shadow-lg"
      onClick={() => null}
    >
      <img
        src={imageUrl}
        alt="Current Users Profile Picture"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default ProfileCircle;
