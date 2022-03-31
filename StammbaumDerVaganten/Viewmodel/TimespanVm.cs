using System;
using System.Diagnostics;

namespace StammbaumDerVaganten
{
    public class TimespanVm : Viewmodel<Timespan>
    {
        public TimepointVm StartTimepoint
        {
            get { return MainViewmodel.ActiveVm.GetSharedTimepointVm(model.StartTimepointRef.Latest); }
            set
            {
                if (MainViewmodel.ActiveVm.GetSharedTimepointVm(model.StartTimepointRef.Latest) != value)
                {
                    Debug.Assert(MainViewmodel.ActiveVm.GetSharedTimepointVm(model.StartTimepointRef.Latest).Model == model.StartTimepointRef);

                    model.StartTimepointRef.Latest = value.Model.Reference;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("Start");
                    NotifyPropertyChanged("CustomStart");
                }
            }
        }

        public TimepointVm EndTimepoint
        {
            get { return MainViewmodel.ActiveVm.GetSharedTimepointVm(model.EndTimepointRef.Latest); }
            set
            {
                if (MainViewmodel.ActiveVm.GetSharedTimepointVm(model.EndTimepointRef.Latest) != value)
                {
                    Debug.Assert(MainViewmodel.ActiveVm.GetSharedTimepointVm(model.EndTimepointRef.Latest).Model == model.EndTimepointRef);

                    model.EndTimepointRef.Latest = value.Model.Reference;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("End");
                    NotifyPropertyChanged("CustomEnd");
                }
            }
        }

        public bool CustomStart
        {
            get { return model.StartIsCustom(); }
        }

        public bool CustomEnd
        {
            get { return model.EndIsCustom(); }
        }

        public DateTime Start
        {
            get { return model.Start; }
            set
            {
                if (model.Start != value)
                {
                    model.Start = new Date(value);
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End
        {
            get { return model.End; }
            set
            {
                if (model.End != value)
                {
                    model.End = new Date(value);
                    NotifyPropertyChanged();
                }
            }
        }

        public TimespanVm()
        { }

        public TimespanVm(Timespan timespan)
            : base(timespan)
        { }
    }
}
