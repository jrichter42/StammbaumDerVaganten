using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Timepoint : DataObject, INotifyPropertyChanged
    {
        public static int NEXT_ID = 1;

        protected override int GetNEXTID()
        {
            return NEXT_ID;
        }

        protected override void SetNEXTID(int id)
        {
            NEXT_ID = id;
        }

        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public Date _D
        {
            get { return date; }
            set { date = value; }
        }

        [DataMember]
        public String _N
        {
            get { return name; }
            set { name = value; }
        }
        #endregion

        protected Date date = new Date();

        protected String name = new String();

        #region Accessors
        public Date Date
        {
            get { return date; }
            set
            {
                if (date != value)
                {
                    date = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime Date_
        {
            get { return date.Value; }
            set
            {
                if (date.Value != value)
                {
                    date.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Name
        {
            get { return name.Value; }
            set
            {
                if (name.Value != value)
                {
                    name.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public Timepoint() : base()
        {

        }

        public Timepoint(bool claimID) : base(claimID)
        {

        }

        public void ReassignID(int id)
        {
            ID = id;
        }

        public void AssignNewID()
        {
            ID = NEXT_ID++;
        }

        public override string ToString()
        {
            return name.Value + " " + date.Year  + " [" + id.ToString() + "]";
        }

        public string ToString_
        {
            get { return ToString(); }
        }
    }

    [DataContract]
    public class Timespan : INotifyPropertyChanged
    {
        #region INotifyPropertyChanged
        public event PropertyChangedEventHandler PropertyChanged;

        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public Date _S
        {
            get { return start; }
            set { start = value; }
        }
        [DataMember]
        public Date _E
        {
            get { return end; }
            set { end = value; }
        }
        #endregion

        protected int startTimepoint = Timepoint.ID_INVALID;
        protected int endTimepoint = Timepoint.ID_INVALID;
        
        protected Date start = new Date();
        protected Date end = new Date();

        #region Accessors
        public int StartTimepoint
        {
            get { return startTimepoint; }
            set
            {
                if (startTimepoint != value)
                {
                    startTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("StartTimepointUsed_");
                }
            }
        }

        public int EndTimepoint
        {
            get { return endTimepoint; }
            set
            {
                if (endTimepoint != value)
                {
                    endTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("EndTimepointUsed_");
                }
            }
        }

        public bool StartTimepointUsed_
        {
            get { return startTimepoint != Timepoint.ID_INVALID; }
        }

        public bool EndTimepointUsed_
        {
            get { return endTimepoint != Timepoint.ID_INVALID; }
        }

        public Date Start
        {
            get
            {
                if (startTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(startTimepoint);
                        if (tp != null)
                        {
                            return tp.Date;
                        }
                    }
                }
                return start;
            }
            set
            {
                if (startTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(startTimepoint);
                        if (tp != null)
                        {
                            if (tp.Date != value)
                            {
                                tp.Date = value;
                                NotifyPropertyChanged();
                                return;
                            }
                        }
                    }
                }
                Log.Write(Log_Level.Exception, "Wasn't able set Timespan.Start value in Timepoint");
            }
        }

        public Date End
        {
            get
            {
                if (endTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(endTimepoint);
                        if (tp != null)
                        {
                            return tp.Date;
                        }
                    }
                }
                return end;
            }
            set
            {
                if (endTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(endTimepoint);
                        if (tp != null)
                        {
                            if (tp.Date != value)
                            {
                                tp.Date = value;
                                NotifyPropertyChanged();
                                return;
                            }
                        }
                    }
                }
                Log.Write(Log_Level.Exception, "Wasn't able set Timespan.End value in Timepoint");
            }
        }

        public DateTime Start_
        {
            get
            {
                if (startTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(startTimepoint);
                        if (tp != null)
                        {
                            return tp.Date_;
                        }
                    }
                }
                return start.Value;
            }
            set
            {
                if (startTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(startTimepoint);
                        if (tp != null)
                        {
                            if (tp.Date_ != value)
                            {
                                tp.Date_ = value;
                                NotifyPropertyChanged();
                                return;
                            }
                        }
                    }
                }
                Log.Write(Log_Level.Exception, "Wasn't able set Timespan.Start value in Timepoint");
            }
        }

        public DateTime End_
        {
            get
            {
                if (endTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(endTimepoint);
                        if (tp != null)
                        {
                            return tp.Date_;
                        }
                    }
                }
                return end.Value;
            }
            set
            {
                if (endTimepoint != Timepoint.ID_INVALID)
                {
                    Data data = MainViewModel.ActiveData;
                    if (data != null)
                    {
                        Timepoint tp = data.GetTimepointyID(endTimepoint);
                        if (tp != null)
                        {
                            if (tp.Date_ != value)
                            {
                                tp.Date_ = value;
                                NotifyPropertyChanged();
                                return;
                            }
                        }
                    }
                }
                Log.Write(Log_Level.Exception, "Wasn't able set Timespan.End value in Timepoint");
            }
        }
        #endregion

        public Timespan() : base()
        {

        }
    }
}
