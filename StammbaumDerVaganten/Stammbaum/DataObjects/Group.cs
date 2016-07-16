using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    public enum GroupType_Type
    {
        None,
        Stamm,
        Meute,
        Rudel,
        Gilde,
        Sippe,
        Runde,
        Kreis
    }

    [DataContract]
    public class GroupType : DataPiece<GroupType_Type>
    {

    }

    [DataContract]
    public class GroupPhase : DataObject, INotifyPropertyChanged
    {
        #region INotifyPropertyChanged
        public virtual event PropertyChangedEventHandler PropertyChanged;

        //Used by derived classes in this case
        protected void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (PropertyChanged != null)
            {
                PropertyChanged(this, new PropertyChangedEventArgs(propertyName));
            }
        }
        #endregion

        #region Serialization
        [DataMember]
        public GroupType _T
        {
            get { return type; }
            set { type = value; }
        }
        [DataMember]
        public Timespan _TSP
        {
            get { return timespan; }
            set { timespan = value; }
        }
        #endregion

        protected GroupType type = new GroupType();
        protected Timespan timespan = new Timespan();

        #region Accessors
        public GroupType_Type Type
        {
            get { return type.Value; }
            set
            {
                if (type.Value != value)
                {
                    type.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region Timespan
        public Timespan Timespan
        {
            get { return timespan; }
            set
            {
                if (timespan != value)
                {
                    timespan = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int StartTimepoint_
        {
            get { return timespan.StartTimepoint; }
            set
            {
                if (timespan.StartTimepoint != value)
                {
                    timespan.StartTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("StartTimepointUsed_");
                }
            }
        }

        public int EndTimepoint_
        {
            get { return timespan.EndTimepoint; }
            set
            {
                if (timespan.EndTimepoint != value)
                {
                    timespan.EndTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("EndTimepointUsed_");
                }
            }
        }

        public bool StartTimepointUsed_
        {
            get { return timespan.StartTimepoint != Timepoint.ID_INVALID; }
        }

        public bool EndTimepointUsed_
        {
            get { return timespan.EndTimepoint != Timepoint.ID_INVALID; }
        }

        public DateTime Start_
        {
            get { return timespan.Start.Value; }
            set
            {
                if (timespan.Start_ != value)
                {
                    timespan.Start_ = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End_
        {
            get { return timespan.End.Value; }
            set
            {
                if (timespan.End_ != value)
                {
                    timespan.End_ = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion
        #endregion

        #region FilteredTimepoints
        protected ObservableCollection<Timepoint> filteredTimepoints = new ObservableCollection<Timepoint>();

        public ObservableCollection<Timepoint> FilteredTimepoints
        {
            get
            {
                Data data = MainViewModel.ActiveData;
                if (data != null && (data.Timepoints.Count + 1) != filteredTimepoints.Count)
                {
                    UpdateFilteredTimepoints();
                }
                return filteredTimepoints;
            }
        }

        protected virtual void UpdateFilteredTimepoints()
        {
            filteredTimepoints.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Timepoint> timepoints = vm.Timepoints;
            if (timepoints == null)
            {
                return;
            }

            foreach (Timepoint t in timepoints)
            {
                filteredTimepoints.Add(t);
            }

            //Sort by date, youngest timepoint first
            int newIdx;
            for (int i = 1; i < filteredTimepoints.Count; i++)
            {
                newIdx = i - 1;
                //Quit if our year is already smaller or equal to the year before us
                if (filteredTimepoints[i].Date.Year <= filteredTimepoints[newIdx].Date.Year)
                {
                    continue;
                }
                while (newIdx > 0 && filteredTimepoints[i].Date.Year > filteredTimepoints[newIdx - 1].Date.Year)
                {
                    newIdx--;
                }
                filteredTimepoints.Move(i, newIdx);
            }

            //Insert reset item
            Timepoint invalidTP = new Timepoint();
            invalidTP.ReassignID(Timepoint.ID_INVALID); //NEVER DO THIS!!! unless you know what you are doing
            invalidTP.Date.Year = 42;
            invalidTP.Name = "RESET";
            filteredTimepoints.Insert(0, invalidTP);
        }
        #endregion

        public GroupPhase() : base()
        {
            type.Init(GroupType_Type.None);
        }
    }

    [DataContract]
    public class Group : DataObject, INotifyPropertyChanged
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
        public GroupPhase _MP
        {
            get { return mainPhase; }
            set { mainPhase = value; }
        }

        [DataMember]
        public ObservableCollection<GroupPhase> _AP
        {
            get { return additionalPhases; }
            set { additionalPhases = value; }
        }
        
        [DataMember]
        public String _N
        {
            get { return name; }
            set { name = value; }
        }
        
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        #endregion

        protected GroupPhase mainPhase = new GroupPhase();
        protected ObservableCollection<GroupPhase> additionalPhases = new ObservableCollection<GroupPhase>();
        
        protected String name = new String();
        
        protected String comment = new String();

        #region Accessors
        public GroupType_Type Type
        {
            get { return mainPhase.Type; }
            set
            {
                if (mainPhase.Type != value)
                {
                    mainPhase.Type = value;
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

        #region Timespan
        public Timespan Timespan
        {
            get { return mainPhase.Timespan; }
            set
            {
                if (mainPhase.Timespan != value)
                {
                    mainPhase.Timespan = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int StartTimepoint_
        {
            get { return mainPhase.StartTimepoint_; }
            set
            {
                if (mainPhase.StartTimepoint_ != value)
                {
                    mainPhase.StartTimepoint_ = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("UseStartTimepoint_");
                }
            }
        }

        public int EndTimepoint_
        {
            get { return mainPhase.EndTimepoint_; }
            set
            {
                if (mainPhase.EndTimepoint_ != value)
                {
                    mainPhase.EndTimepoint_ = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("UseEndTimepoint_");
                }
            }
        }

        //Sets start timepoint id to invalid
        public bool UseStartTimepoint_
        {
            get { return mainPhase.StartTimepoint_ == Timepoint.ID_INVALID; }
            set
            {
                if (value == false && UseStartTimepoint_ != value)
                {
                    mainPhase.StartTimepoint_ = Timepoint.ID_INVALID;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("StartTimepoint_");
                    NotifyPropertyChanged("Start_");
                }
            }
        }

        //Sets end timepoint id to invalid
        public bool UseEndTimepoint_
        {
            get { return mainPhase.EndTimepoint_ == Timepoint.ID_INVALID; }
            set
            {
                if (value == false && UseEndTimepoint_ != value)
                {
                    mainPhase.EndTimepoint_ = Timepoint.ID_INVALID;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("EndTimepoint_");
                    NotifyPropertyChanged("End_");
                }
            }
        }

        public DateTime Start_
        {
            get { return mainPhase.Start_; }
            set
            {
                if (mainPhase.Start_ != value)
                {
                    mainPhase.Start_ = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End_
        {
            get { return mainPhase.End_; }
            set
            {
                if (mainPhase.End_ != value)
                {
                    mainPhase.End_ = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public string Comment
        {
            get { return comment.Value; }
            set
            {
                if (comment.Value != value)
                {
                    comment.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<GroupPhase> AdditionalPhases
        {
            get { return additionalPhases; }
            set
            {
                if (additionalPhases != value)
                {
                    additionalPhases = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public Group() : base()
        {

        }

        public Group(bool claimID) : base(claimID)
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
            return mainPhase.Timespan.Start.Year + " " + mainPhase.Type.ToString() + " " + name.Value + " [" + id.ToString() + "]";
        }

        public string ToString_
        {
            get { return ToString(); }
        }
    }
}
