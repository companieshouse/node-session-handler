import chai from "chai";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";

chai.use(sinonChai);
chai.use(chaiAsPromised);

process.env.COOKIE_SECRET = "Xy6onkjQWF0TkRn0hfdqUw==";
