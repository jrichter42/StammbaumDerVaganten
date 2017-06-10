using System;

namespace StammbaumDerVaganten
{
    public class TimepointVm : Viewmodel<Timepoint>
    {
        public DateTime Date
        {
            get { return model.Date.Value; }
            set
            {
                if (model.Date.Value != value)
                {
                    model.Date.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Name
        {
            get { return model.Name.Value; }
            set
            {
                if (model.Name.Value != value)
                {
                    model.Name.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        protected static TimepointVm invalid = new TimepointVm { model = new Timepoint { ID = Timepoint.ID_INVALID, Name = new String("Custom"), Date = new Date { Year = 1 } } };

        public static TimepointVm INVALID
        {
            get { return invalid; }
        }

        public TimepointVm() : base()
        {

        }

        public TimepointVm(Timepoint timepoint) : base(timepoint)
        {

        }
        
        public string ToString_
        {
            get { return model.ToString(); }
        }

        protected static new Timepoint CreateModelInternal()
        {
            return new Timepoint(true);
        }
    }
}
