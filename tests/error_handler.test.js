const ErrorTypes = require("../errors/error_types");
const ErrorHandler = require("../errors/handler");
const { UserErrs, INTERNAL_ERR } = ErrorTypes;

describe("ErrorHandler", () => {

  it("should default to INTERNAL_ERR", done => {
    expect(ErrorHandler({
      message: "some error object we don't know the shape of"
    })).toEqual({
      type: INTERNAL_ERR,
      errors: {
        message: "some error object we don't know the shape of"
      }
    });

    done();
  });

  it("should handle REGISTRATION_ERR", done => {
    const errObj = { 
      errors: {
        message: "some message" 
      },
      name: "ValidationError"
    };
    const received = ErrorHandler(errObj);
    const expected = {
      type: UserErrs.REGISISTRATION_ERR,
      errors: {
        message: "some message"
      }
    };
    expect(received).toEqual(expected);

    done();
  });
});