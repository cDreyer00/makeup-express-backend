async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/h94/IP-Adapter-FaceID",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	return response;
}
query({"inputs": "Astronaut riding a horse"}).then((response) => {
	// Use image
    response.json().then((data) => {
        console.log(data);
    });

});