function test() {
  console.log(
    doPost({ postData: { contents: JSON.stringify({ temperature: 22.1 }) } })
  );
}
