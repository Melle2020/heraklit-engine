import Heraklit  from "./heraklit"; 
test('ModelChecker', () => {
    expect(new Heraklit("src/data/fig10.hera","G").HeraklitEngine()).toBe("startState -> rs1 -> /");
  });