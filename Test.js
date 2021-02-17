function test() {
  console.log(
    main({ postData: { contents: JSON.stringify({ temperature: 22.1 }) } })
  );
}
