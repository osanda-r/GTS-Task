<template>
  <v-container class="container">
    <v-row justify="center">
      <v-col cols="12" class="text-center">
        <h1 class="headline">404 - Page Not Found</h1>
        <div class="svg-container">
          <svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="200" fill="#f0f4f8"/>
            <circle cx="150" cy="100" r="80" fill="#ff6b6b" opacity="0.2"/>
            <path d="M100 80 Q150 20 200 80 T300 80" stroke="#ff6b6b" stroke-width="5" fill="none"/>
            <text x="150" y="110" font-family="Roboto, sans-serif" font-size="60" fill="#333" text-anchor="middle">404</text>
            <text x="150" y="140" font-family="Roboto, sans-serif" font-size="20" fill="#666" text-anchor="middle">Lost in Space</text>
          </svg>
        </div>
        <p class="message">Oops! It looks like you've wandered into the cosmic void. The page you're looking for doesn't exist or has drifted off into another galaxy.</p>
        <p class="sub-message">Don't worry, let's get you back on track!</p>
        <v-btn color="error" rounded href="/" class="mt-4">Return to Home</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>


<style scoped>
.container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.headline {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: #333;
}

.svg-container {
  margin: 20px 0;
}

.message {
  font-size: 1.2em;
  line-height: 1.5;
  margin-bottom: 15px;
  color: #555;
}

.sub-message {
  font-size: 1em;
  color: #777;
  margin-bottom: 30px;
}
</style>
