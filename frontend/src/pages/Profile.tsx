// ************* Managing Profile Page at 'My Account' Here *************

import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

interface ProfileData {
  name: string;
  surname: string;
  email: string;
  createdDate: string;
}

export const Profile = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const { token } = useAuth();

  useEffect(() => {

    // -> Get user informations with token in my logic
    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:3000/user/profile', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`, 
              },
            });
        
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
        
            const {user_data} = await response.json();

            setProfileData(user_data);

      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  // console.log("PROFILEDATA",profileData);

  if (!profileData) return <LoadingSpinner/>;

  return (
    <div className="max-w-2xl mx-auto p-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">My Profile</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
        
        <div className="sm:col-span-2 space-y-4 order-2 sm:order-1">
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg">{profileData.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Surname</label>
            <p className="text-lg">{profileData.surname}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg">{profileData.email}</p>
          </div>
        </div>

  
        <div className="sm:col-span-1 flex justify-center order-1 sm:order-2">
          <img
            src="https://www.newmind-neurofeedback-centers.com/images/NewMind-Neurofeedback.png"
            alt="Profile"
          />
        </div>
      </CardContent>
    </Card>
  </div>
  );
};
