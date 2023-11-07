import moment from "moment";

const dateFormat = (date) => {
  return moment(new Date(date)).format("DD-MM-YYYY");
};

export default dateFormat;
