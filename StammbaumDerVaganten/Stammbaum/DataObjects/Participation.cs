﻿using System;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;

namespace StammbaumDerVaganten
{
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

        protected Date start = new Date();
        protected Date end = new Date();

        #region Accessors
        public Date Start
        {
            get { return start; }
            set
            {
                if (start != value)
                {
                    start = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public Date End
        {
            get { return end; }
            set
            {
                if (end != value)
                {
                    end = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region Start_
        public DateTime Start_
        {
            get { return start.Value; }
            set
            {
                if (start.Value != value)
                {
                    start.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public bool Start_YearDefined
        {
            get { return start.YearDefined; }
            set
            {
                if (start.YearDefined != value)
                {
                    start.YearDefined = value;
                    NotifyPropertyChanged("Start_DayDefined");
                    NotifyPropertyChanged("Start_MonthDefined");
                    NotifyPropertyChanged("Start_YearDefined");
                }
            }
        }

        public bool Start_MonthDefined
        {
            get { return start.MonthDefined; }
            set
            {
                if (start.MonthDefined != value)
                {
                    start.MonthDefined = value;
                    NotifyPropertyChanged("Start_DayDefined");
                    NotifyPropertyChanged("Start_MonthDefined");
                    NotifyPropertyChanged("Start_YearDefined");
                }
            }
        }

        public bool Start_DayDefined
        {
            get { return start.DayDefined; }
            set
            {
                if (start.DayDefined != value)
                {
                    start.DayDefined = value;
                    NotifyPropertyChanged("Start_DayDefined");
                    NotifyPropertyChanged("Start_MonthDefined");
                    NotifyPropertyChanged("Start_YearDefined");
                }
            }
        }
        #endregion

        #region End_
        public DateTime End_
        {
            get { return end.Value; }
            set
            {
                if (end.Value != value)
                {
                    end.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public bool End_YearDefined
        {
            get { return end.YearDefined; }
            set
            {
                if (end.YearDefined != value)
                {
                    end.YearDefined = value;
                    NotifyPropertyChanged("End_DayDefined");
                    NotifyPropertyChanged("End_MonthDefined");
                    NotifyPropertyChanged("End_YearDefined");
                }
            }
        }

        public bool End_MonthDefined
        {
            get { return end.MonthDefined; }
            set
            {
                if (end.MonthDefined != value)
                {
                    end.MonthDefined = value;
                    NotifyPropertyChanged("End_DayDefined");
                    NotifyPropertyChanged("End_MonthDefined");
                    NotifyPropertyChanged("End_YearDefined");
                }
            }
        }

        public bool End_DayDefined
        {
            get { return end.DayDefined; }
            set
            {
                if (end.DayDefined != value)
                {
                    end.DayDefined = value;
                    NotifyPropertyChanged("End_DayDefined");
                    NotifyPropertyChanged("End_MonthDefined");
                    NotifyPropertyChanged("End_YearDefined");
                }
            }
        }
        #endregion

        public bool WholeTime
        {
            get
            {
                return start.NoneDefined && end.NoneDefined;
            }
            set
            {
                if (value == true && (!start.NoneDefined || !end.NoneDefined))
                {
                    start.NoneDefined = true;
                    end.NoneDefined = true;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public Timespan() : base()
        {

        }
    }

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

        #region Start_
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

        public bool Start_YearDefined
        {
            get { return timespan.Start.YearDefined; }
            set
            {
                if (timespan.Start.YearDefined != value)
                {
                    timespan.Start.YearDefined = value;
                    NotifyPropertyChanged("Start_DayDefined");
                    NotifyPropertyChanged("Start_MonthDefined");
                    NotifyPropertyChanged("Start_YearDefined");
                }
            }
        }

        public bool Start_MonthDefined
        {
            get { return timespan.Start.MonthDefined; }
            set
            {
                if (timespan.Start.MonthDefined != value)
                {
                    timespan.Start.MonthDefined = value;
                    NotifyPropertyChanged("Start_DayDefined");
                    NotifyPropertyChanged("Start_MonthDefined");
                    NotifyPropertyChanged("Start_YearDefined");
                }
            }
        }

        public bool Start_DayDefined
        {
            get { return timespan.Start.DayDefined; }
            set
            {
                if (timespan.Start.DayDefined != value)
                {
                    timespan.Start.DayDefined = value;
                    NotifyPropertyChanged("Start_DayDefined");
                    NotifyPropertyChanged("Start_MonthDefined");
                    NotifyPropertyChanged("Start_YearDefined");
                }
            }
        }
        #endregion

        #region End_
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

        public bool End_YearDefined
        {
            get { return timespan.End.YearDefined; }
            set
            {
                if (timespan.End.YearDefined != value)
                {
                    timespan.End.YearDefined = value;
                    NotifyPropertyChanged("End_DayDefined");
                    NotifyPropertyChanged("End_MonthDefined");
                    NotifyPropertyChanged("End_YearDefined");
                }
            }
        }

        public bool End_MonthDefined
        {
            get { return timespan.End.MonthDefined; }
            set
            {
                if (timespan.End.MonthDefined != value)
                {
                    timespan.End.MonthDefined = value;
                    NotifyPropertyChanged("End_DayDefined");
                    NotifyPropertyChanged("End_MonthDefined");
                    NotifyPropertyChanged("End_YearDefined");
                }
            }
        }

        public bool End_DayDefined
        {
            get { return timespan.End.DayDefined; }
            set
            {
                if (timespan.End.DayDefined != value)
                {
                    timespan.End.DayDefined = value;
                    NotifyPropertyChanged("End_DayDefined");
                    NotifyPropertyChanged("End_MonthDefined");
                    NotifyPropertyChanged("End_YearDefined");
                }
            }
        }
        #endregion

        public bool WholeTime_
        {
            get { return timespan.WholeTime; }
            set
            {
                if (timespan.WholeTime != value)
                {
                    timespan.WholeTime = value;
                    NotifyPropertyChanged();
                }
            }
        }

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