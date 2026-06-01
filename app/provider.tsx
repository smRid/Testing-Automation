'use client'

import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useEffect } from 'react'

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
const { isLoaded, isSignedIn } = useUser();

useEffect(() => {
  if (!isLoaded || !isSignedIn) {
    return;
  }

  CreateNewUser().catch((error) => {
    console.log("Error syncing user: ", error);
  });
}, [isLoaded, isSignedIn])

const CreateNewUser = async () => {
  const result = await axios.post('/api/users', {});

  console.log("Result", result);
}

  return (
    <div>{children}</div>
  )
}

export default Provider
