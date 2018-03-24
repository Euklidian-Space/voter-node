const { validatePassword } = require("../../models/user/validations");

describe("validatePassword", () => {
  it("should return a rejected promise when password is too short", done => {
    expect(validatePassword("a")).rejects.toBe("Password must be atleast 8 characters.");
    done();
  });

  it("should return a rejected promise when password does not conform to format", done => {
    expect(validatePassword("password1234"))
      .rejects
      .toBe("Password must contain atleast one uppercase letter, one lowercase letter, one number and one special character.");
    done();
  });

  it("should return given password when constraints are satisfied", done => {
    const pw = "Password1234!";
    expect(validatePassword(pw))
      .resolves
      .toBe(pw);

    done();
  });
});

