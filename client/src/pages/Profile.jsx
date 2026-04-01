import { useParams } from "react-router-dom";

const Profile = () => {
  const { id } = useParams();
  return <div className="p-6">Profile {id} (TODO)</div>;
};

export default Profile;

