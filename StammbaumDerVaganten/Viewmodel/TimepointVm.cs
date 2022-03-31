using System;

namespace StammbaumDerVaganten
{
    public class TimepointVm : ViewmodelOfReferenceable<Timepoint>
    {
        public DateTime Date
        {
            get { return model.Date.Latest; }
            set
            {
                if (model.Date.Latest != value)
                {
                    model.Date.Latest = new Date(value);
                    NotifyPropertyChanged();
                }
            }
        }

        public string Name
        {
            get { return model.Name.Latest; }
            set
            {
                if (model.Name.Latest != value)
                {
                    model.Name.Latest = value;
                    NotifyPropertyChanged();
                }
            }
        }

        protected static TimepointVm invalid = new TimepointVm { model = Timepoint.INVALID };

        public static TimepointVm INVALID
        {
            get { return invalid; }
        }

        public TimepointVm()
        { }

        public TimepointVm(Timepoint timepoint)
            : base(timepoint)
        { }
    }
}
