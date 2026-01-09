exports.testJWT = async (req, res) =>{
     console.log('\n=== JWT TEST ENDPOINT ===');
  
  const token = req.cookies.admin_token;
  if (!token) {
    return res.json({ error: 'No token in cookies' });
  }

   console.log('Token received:', token);

    try{
        //Try to decode 
        const decoded = jwt.decode(token);
        console.log('Decoded (no verify):', decoded);

         // Try to verify
    const verified = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    console.log('Verified:', verified);

    res.json({ 
      success: true, 
      decoded, 
      verified,
      envSecretExists: !!process.env.JWT_ACCESS_SECRET
    });
    }catch(err){

        console.error('Verification failed: ',err.message);
        res.json({ 
      success: false, 
      error: err.message,
      decoded: jwt.decode(token)
    });
    }

}