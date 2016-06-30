using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

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
        [DataMember]
        public bool _WT
        {
            get { return wholeTime; }
            set { wholeTime = value; }
        }
        #endregion
        
        protected Date start = new Date();
        protected Date end = new Date();
        protected bool wholeTime = false;

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
            get { return wholeTime; }
            set
            {
                if (wholeTime != value)
                {
                    wholeTime = value;
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

        #region GroupStrings
        protected List<Group> _filteredGroups;
        protected List<Group> filteredGroups
        {
            get
            {
                if (_filteredGroups == null)
                {
                    _filteredGroups = new List<Group>();
                }
                return _filteredGroups;
            }
            set
            {
                _filteredGroups = value;
            }
        }

        protected virtual void UpdateFilteredGroups()
        {
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
                filteredGroups.Add(g);
            }
        }

        public ObservableCollection<string> GroupStrings
        {
            get
            {
                UpdateFilteredGroups();

                ObservableCollection<string> groupStrings = new ObservableCollection<string>();
                foreach (Group g in filteredGroups)
                {
                    groupStrings.Add(g.ToString());
                }

                return groupStrings;
            }
        }

        public int SelectedGroupString
        {
            get
            {
                if (group == ID_INVALID)
                {
                    return 0;
                }

                int fGroupsSize = filteredGroups.Count;
                for (int i = 0; i < fGroupsSize; i++)
                {
                    if (filteredGroups[i].ID == group)
                    {
                        return i;
                    }
                }

                return 0;
            }
            set
            {
                if (value < 0 || value >= filteredGroups.Count)
                {
                    return;
                }
                group = filteredGroups[value].ID;
                NotifyPropertyChanged();
            }
        }
        #endregion

        public Participation() : base()
        {

        }
    }

    [DataContract]
    public class Membership : Participation, INotifyPropertyChanged
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

        public Membership() : base()
        {

        }
    }

    [DataContract]
    public class Activity : Participation, INotifyPropertyChanged
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
        public int _R
        {
            get { return role; }
            set { role = value; }
        }
        #endregion

        #region GroupStrings & RoleStrings
        protected override void UpdateFilteredGroups()
        {
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
                if (groupTypeFilter != GroupType_Type.None && g.Type != groupTypeFilter)
                {
                    filteredGroups.Add(g);
                }
            }
        }

        protected ObservableCollection<Role> _filteredRoles;
        protected ObservableCollection<Role> filteredRoles
        {
            get
            {
                if (_filteredRoles == null)
                {
                    _filteredRoles = new ObservableCollection<Role>();
                }
                return _filteredRoles;
            }
            set
            {
                _filteredRoles = value;
            }
        }

        protected virtual void UpdateFilteredRoles()
        {
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

            GroupType_Type groupTypeFilter = GroupType_Type.None;
            if (group != ID_INVALID)
            {
                Data data = MainViewModel.ActiveData;
                if (data != null)
                {
                    Group g = data.GetGroupByID(role);
                    if (g != null)
                    {
                        groupTypeFilter = g.Type;
                    }
                }
            }

            foreach (Role r in roles)
            {
                if (groupTypeFilter != GroupType_Type.None && r.GroupType != groupTypeFilter)
                {
                    filteredRoles.Add(r);
                }
            }
        }

        public ObservableCollection<string> RoleStrings
        {
            get
            {
                UpdateFilteredRoles();

                ObservableCollection<string> roleStrings = new ObservableCollection<string>();
                foreach (Role g in filteredRoles)
                {
                    roleStrings.Add(g.ToString());
                }

                return roleStrings;
            }
        }

        public int SelectedRoleString
        {
            get
            {
                if (role == ID_INVALID)
                {
                    return 0;
                }

                int fRoleSize = filteredRoles.Count;
                for (int i = 0; i < fRoleSize; i++)
                {
                    if (filteredRoles[i].ID == role)
                    {
                        return i;
                    }
                }

                return 0;
            }
            set
            {
                if (value < 0 || value >= filteredRoles.Count)
                {
                    return;
                }
                role = filteredRoles[value].ID;
                NotifyPropertyChanged();
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

    [DataContract]
    public class Scout : DataObject, INotifyPropertyChanged
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
        public String _FN
        {
            get { return forename; }
            set { forename = value; }
        }
        [DataMember]
        public String _LN
        {
            get { return lastname; }
            set { lastname = value; }
        }
        [DataMember]
        public String _SN
        {
            get { return scoutname; }
            set { scoutname = value; }
        }
        [DataMember]
        public Date _BD
        {
            get { return birthdate; }
            set { birthdate = value; }
        }
        [DataMember]
        public String _CI
        {
            get { return contactInfo; }
            set { contactInfo = value; }
        }
        [DataMember]
        public String _C
        {
            get { return comment; }
            set { comment = value; }
        }
        [DataMember]
        public ObservableCollection<Membership> _M
        {
            get { return memberships; }
            set { memberships = value; }
        }
        [DataMember]
        public ObservableCollection<Activity> _A
        {
            get { return activities; }
            set { activities = value; }
        }
        #endregion

        protected String forename = new String();
        protected String lastname = new String();
        protected String scoutname = new String();

        protected Date birthdate = new Date();

        protected String contactInfo = new String();
        protected String comment = new String();

        protected ObservableCollection<Membership> memberships = new ObservableCollection<Membership>();
        protected ObservableCollection<Activity> activities = new ObservableCollection<Activity>();

        #region Accessors
        public string Forename
        {
            get { return forename.Value; }
            set
            {
                if (forename.Value != value)
                {
                    forename.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Lastname
        {
            get { return lastname.Value; }
            set
            {
                if (lastname.Value != value)
                {
                    lastname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public string Scoutname
        {
            get { return scoutname.Value; }
            set
            {
                if (scoutname.Value != value)
                {
                    scoutname.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public Date Birthdate
        {
            get { return birthdate; }
            set
            {
                if (birthdate != value)
                {
                    birthdate = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region Birthdate_
        public DateTime Birthdate_
        {
            get { return birthdate.Value; }
            set
            {
                if (birthdate.Value != value)
                {
                    birthdate.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public bool Birthdate_YearDefined
        {
            get { return birthdate.YearDefined; }
            set
            {
                if (birthdate.YearDefined != value)
                {
                    birthdate.YearDefined = value;

                    NotifyPropertyChanged("Birthdate_DayDefined");
                    NotifyPropertyChanged("Birthdate_MonthDefined");
                    NotifyPropertyChanged("Birthdate_YearDefined");
                }
            }
        }

        public bool Birthdate_MonthDefined
        {
            get { return birthdate.MonthDefined; }
            set
            {
                if (birthdate.MonthDefined != value)
                {
                    birthdate.MonthDefined = value;

                    NotifyPropertyChanged("Birthdate_DayDefined");
                    NotifyPropertyChanged("Birthdate_MonthDefined");
                    NotifyPropertyChanged("Birthdate_YearDefined");
                }
            }
        }

        public bool Birthdate_DayDefined
        {
            get { return birthdate.DayDefined; }
            set
            {
                if (birthdate.DayDefined != value)
                {
                    birthdate.DayDefined = value;

                    NotifyPropertyChanged("Birthdate_DayDefined");
                    NotifyPropertyChanged("Birthdate_MonthDefined");
                    NotifyPropertyChanged("Birthdate_YearDefined");
                }
            }
        }
        #endregion

        public string ContactInfo
        {
            get { return contactInfo.Value; }
            set
            {
                if (contactInfo.Value != value)
                {
                    contactInfo.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

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

        public ObservableCollection<Membership> Memberships
        {
            get { return memberships; }
            set
            {
                if (memberships != value)
                {
                    memberships = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public ObservableCollection<Activity> Activities
        {
            get { return activities; }
            set
            {
                if (activities != value)
                {
                    activities = value;
                    NotifyPropertyChanged();
                }
            }
        }
        #endregion

        public Scout() : base()
        {

        }

        #region Retrieve Memberships and Activities
        public Membership GetFirstMembershipByGroup(Group group)
        {
            ObservableCollection<Membership> result = new ObservableCollection<Membership>();
            foreach (Membership ms in memberships)
            {
                if (ms.Group == group)
                {
                    return ms;
                }
            }
            return null;
        }

        public Activity GetFirstActivityByGroup(Group group)
        {
            foreach (Activity a in activities)
            {
                if (a.Group == group)
                {
                    return a;
                }
            }
            return null;
        }

        public ObservableCollection<Membership> GetMembershipsInGroup(Group group)
        {
            ObservableCollection<Membership> result = new ObservableCollection<Membership>();
            foreach (Membership ms in memberships)
            {
                if (ms.Group == group)
                {
                    result.Add(ms);
                }
            }
            return result;
        }

        public ObservableCollection<Activity> GetActivitiesInGroup(Group group)
        {
            ObservableCollection<Activity> result = new ObservableCollection<Activity>();
            foreach (Activity a in activities)
            {
                if (a.Group == group)
                {
                    result.Add(a);
                }
            }
            return result;
        }
        #endregion

    }
}
