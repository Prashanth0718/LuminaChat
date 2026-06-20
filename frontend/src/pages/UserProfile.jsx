import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function UserProfile() {

  const { id } = useParams();

  const [profile, setProfile] =
    useState(null);

  useEffect(() => {

    API.get(`/user/${id}`)
      .then((res) => {

        setProfile(
          res.data
        );

      });

  }, [id]);

  if (!profile)
    return <h2>Loading...</h2>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">

        <div className="flex items-center gap-4 mb-6">

          <div
            className="
              w-20
              h-20
              rounded-full
              bg-blue-500
              text-white
              flex
              items-center
              justify-center
              text-3xl
              font-bold
            "
          >
            {profile.username
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>

            <h1 className="text-2xl font-bold">
              {profile.full_name}
            </h1>

            <p className="text-gray-500">
              @{profile.username}
            </p>

          </div>

        </div>

        <div className="space-y-3">

          <p>
            <strong>Email:</strong>
            {" "}
            {profile.email}
          </p>

          <p>
            <strong>Phone:</strong>
            {" "}
            {profile.phone}
          </p>

          <p>
            <strong>Gender:</strong>
            {" "}
            {profile.gender}
          </p>

          <p>
            <strong>DOB:</strong>
            {" "}
            {profile.dob}
          </p>

          <p>
            <strong>Bio:</strong>
            {" "}
            {profile.bio}
          </p>

        </div>

      </div>

    </div>
  );
}

export default UserProfile;