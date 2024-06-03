import moment from "moment";

const dateFormat = (date, format = "DD-MM-YYYY") => {
  return moment(new Date(date)).format(format);
};

export default dateFormat;
