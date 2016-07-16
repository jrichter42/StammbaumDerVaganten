using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
    [DataContract]
    public class Participation : DataObject, INotifyPropertyChanged
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
        public Timespan _TSP
        {
            get { return timespan; }
            set { timespan = value; }
        }
        [DataMember]
        public int _G
        {
            get { return group; }
            set { group = value; }
        }
        #endregion

        protected Timespan timespan = new Timespan();
        protected int group = ID_INVALID;

        #region Accessors
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
                    NotifyPropertyChanged("UseStartTimepoint_");
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
                    NotifyPropertyChanged("UseEndTimepoint_");
                }
            }
        }

        //Sets start timepoint id to invalid
        public bool UseStartTimepoint_
        {
            get { return timespan.StartTimepoint == Timepoint.ID_INVALID; }
            set
            {
                if (value == false && UseStartTimepoint_ != value)
                {
                    timespan.StartTimepoint = Timepoint.ID_INVALID;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("StartTimepoint_");
                    NotifyPropertyChanged("Start_");
                }
            }
        }

        //Sets end timepoint id to invalid
        public bool UseEndTimepoint_
        {
            get { return timespan.EndTimepoint == Timepoint.ID_INVALID; }
            set
            {
                if (value == false && UseEndTimepoint_ != value)
                {
                    timespan.EndTimepoint = Timepoint.ID_INVALID;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("EndTimepoint_");
                    NotifyPropertyChanged("End_");
                }
            }
        }

        public DateTime Start_
        {
            get { return timespan.Start.Value; }
            set
            {
                if (timespan.Start.Value != value)
                {
                    timespan.Start.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End_
        {
            get { return timespan.End.Value; }
            set
            {
                if (timespan.End.Value != value)
                {
                    timespan.End.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public int Group
        {
            get { return group; }
            set
            {
                if (group != value)
                {
                    group = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        #region FilteredGroups
        protected ObservableCollection<Group> filteredGroups;

        public ObservableCollection<Group> FilteredGroups
        {
            get
            {
                UpdateFilteredGroups();
                return filteredGroups;
            }
        }

        protected virtual void UpdateFilteredGroups()
        {
            if (filteredGroups == null)
            {
                filteredGroups = new ObservableCollection<Group>();
            }

            filteredGroups.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Group> groups = vm.Groups;
            if (groups == null)
            {
                return;
            }

            foreach (Group g in groups)
            {
                if (g.Type != GroupType_Type.None)
                {
                    filteredGroups.Add(g);
                }
            }

            //Sort by start year, youngest group first
            int newIdx;
            for (int i = 1; i < groups.Count; i++)
            {
                newIdx = i - 1;
                //Quit if our year is already smaller or equal to the year before us
                if (groups[i].Timespan.Start.Year <= groups[newIdx].Timespan.Start.Year)
                {
                    continue;
                }
                while (newIdx > 0 && groups[i].Timespan.Start.Year > groups[newIdx-1].Timespan.Start.Year)
                {
                    newIdx--;
                }
                groups.Move(i, newIdx);
            }
        }
        #endregion

        #region FilteredTimepoints
        protected ObservableCollection<Timepoint> filteredTimepoints;

        public ObservableCollection<Timepoint> FilteredTimepoints
        {
            get
            {
                UpdateFilteredTimepoints();
                return filteredTimepoints;
            }
        }

        protected virtual void UpdateFilteredTimepoints()
        {
            if (filteredTimepoints == null)
            {
                filteredTimepoints = new ObservableCollection<Timepoint>();
            }

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
                if (t.Date_ >= timespan.Start_ && t.Date_ <= timespan.End_)
                {
                    filteredTimepoints.Add(t);
                }
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
        }
        #endregion

        public Participation() : base()
        {

        }
    }

    [DataContract]
    public class Membership : Participation
    {
        public Membership() : base()
        {

        }
    }

    [DataContract]
    public class Activity : Participation
    {
        #region INotifyPropertyChanged w Filters Hack
        private void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (propertyName == "Groups")
            {
                NotifyPropertyChanged("FilteredRoles");
            }
            /*else if (propertyName == "Roles")
            {
                NotifyPropertyChanged("FilteredGroups");
            }*/

            base.NotifyPropertyChanged(propertyName);
        }
        #endregion

        #region Serialization
        [DataMember]
        public int _R
        {
            get { return role; }
            set { role = value; }
        }
        #endregion

        #region FilteredGroups & FilteredRoles
        protected override void UpdateFilteredGroups()
        {
            if (filteredGroups == null)
            {
                filteredGroups = new ObservableCollection<Group>();
            }

            filteredGroups.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Group> groups = vm.Groups;
            if (groups == null)
            {
                return;
            }

            GroupType_Type groupTypeFilter = GroupType_Type.None;
            if (role != ID_INVALID)
            {
                Data data = MainViewModel.ActiveData;
                if (data != null)
                {
                    Role r = data.GetRoleByID(role);
                    if (r != null)
                    {
                        groupTypeFilter = r.GroupType;
                    }
                }
            }

            foreach (Group g in groups)
            {
                if (groupTypeFilter == GroupType_Type.None
                    || g.Type == groupTypeFilter
                    || g.ID == group)
                {
                    filteredGroups.Add(g);
                }
            }
        }

        protected ObservableCollection<Role> filteredRoles;

        public ObservableCollection<Role> FilteredRoles
        {
            get
            {
                UpdateFilteredRoles();
                return filteredRoles;
            }
        }
        protected virtual void UpdateFilteredRoles()
        {
            if (filteredRoles == null)
            {
                filteredRoles = new ObservableCollection<Role>();
            }

            filteredRoles.Clear();

            MainViewModel vm = MainViewModel.ActiveVM;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<Role> roles = vm.Roles;
            if (roles == null)
            {
                return;
            }

            /*GroupType_Type groupTypeFilter = GroupType_Type.None;
            if (group != ID_INVALID)
            {
                Data data = MainViewModel.ActiveData;
                if (data != null)
                {
                    Group g = data.GetGroupByID(group);
                    if (g != null)
                    {
                        groupTypeFilter = g.Type;
                    }
                }
            }*/

            foreach (Role r in roles)
            {
                /*if (groupTypeFilter == GroupType_Type.None || r.GroupType == groupTypeFilter)
                {*/
                filteredRoles.Add(r);
                //}
            }
        }
        #endregion

        protected int role = ID_INVALID;

        #region Accessors
        public int Role
        {
            get { return role; }
            set
            {
                if (role != value)
                {
                    role = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public Activity() : base()
        {

        }
    }

}
