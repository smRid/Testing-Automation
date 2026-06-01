'use client';

import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLoaded, isSignedIn } = useUser();
  const [userDetail, setUserDetail] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const createNewUser = async () => {
      const result = await axios.post('/api/users', {});

      console.log("Result", result);
      setUserDetail(result.data?.user);
    };

    createNewUser().catch((error) => {
      console.log("Error syncing user: ", error);
    });
  }, [isLoaded, isSignedIn]);

  return (
    <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
    <div>{children}</div>
    </UserDetailContext.Provider>
  );
}

export default Provider;
