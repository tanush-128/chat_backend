const ContentModerator = async (text:string) => {
  const headers = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": "d40ed1fc3fde4cadacafd813680a8d35",
  };
  const body = {
    text: text,
    categories: ["Hate", "Sexual", "SelfHarm", "Violence"],
  };
  const res = await fetch(
    "https://frippi-testing.cognitiveservices.azure.com/contentsafety/text:analyze?api-version=2023-10-01",
    {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  console.log(data);
};

ContentModerator("this is a test");
