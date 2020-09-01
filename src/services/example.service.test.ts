import { add, subtract, divide, multiply } from '../services/example.service';

describe("math methods test", () => {
  it('should correctly add two numbers', () => {
    expect(add(3, 5)).toBe(8);
  });
  
  it('should correctly subtract two numbers', () => {
    expect(subtract(10, 4)).toBe(6);
  });
  
  it('should correctly multiply two numbers', () => {
    expect(multiply(3, 5)).toBe(15);
  });
  
  it('should correctly divide two numbers', () => {
    expect(divide(40, 10)).toBe(4);
  });
  
  it('should throw an error on division by 0', () => {
    expect(() => divide(40, 0)).toThrow('Division by 0!');
  });
});