using System;
using System.Collections.ObjectModel;
using System.Runtime.CompilerServices;

namespace StammbaumDerVaganten
{

    public class ParticipationVm<T> : Viewmodel<T> where T : Participation, new()
    {
        public int StartTimepoint
        {
            get { return model.Timespan.StartTimepoint; }
            set
            {
                if (model.Timespan.StartTimepoint != value)
                {
                    model.Timespan.StartTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("CustomStart_");
                }
            }
        }

        public int EndTimepoint
        {
            get { return model.Timespan.EndTimepoint; }
            set
            {
                if (model.Timespan.EndTimepoint != value)
                {
                    model.Timespan.EndTimepoint = value;
                    NotifyPropertyChanged();
                    NotifyPropertyChanged("CustomEnd_");
                }
            }
        }

        public bool CustomStart
        {
            get { return model.Timespan.StartIsCustom(); }
        }

        public bool CustomEnd
        {
            get { return model.Timespan.EndIsCustom(); }
        }

        public DateTime Start
        {
            get { return model.Timespan.Start.Value; }
            set
            {
                if (model.Timespan.Start.Value != value)
                {
                    model.Timespan.Start.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public DateTime End
        {
            get { return model.Timespan.End.Value; }
            set
            {
                if (model.Timespan.End.Value != value)
                {
                    model.Timespan.End.Value = value;
                    NotifyPropertyChanged();
                }
            }
        }

        public int Group
        {
            get { return model.Group; }
            set
            {
                if (model.Group != value)
                {
                    model.Group = value;
                    NotifyPropertyChanged();
                }
            }
        }


        #region FilteredGroups
        protected ObservableCollection<GroupVm> filteredGroups;

        public ObservableCollection<GroupVm> FilteredGroups
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
                filteredGroups = new ObservableCollection<GroupVm>();
            }

            filteredGroups.Clear();

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<GroupVm> groups = vm.Groups;
            if (groups == null)
            {
                return;
            }

            foreach (GroupVm g in groups)
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
                if (groups[i].Start.Year <= groups[newIdx].Start.Year)
                {
                    continue;
                }
                while (newIdx > 0 && groups[i].Start.Year > groups[newIdx - 1].Start.Year)
                {
                    newIdx--;
                }
                groups.Move(i, newIdx);
            }
        }
        #endregion

        #region FilteredTimepoints
        protected ObservableCollection<TimepointVm> filteredTimepoints;

        public ObservableCollection<TimepointVm> FilteredTimepoints
        {
            get
            {
                if (filteredTimepoints == null)
                {
                    filteredTimepoints = new ObservableCollection<TimepointVm>();
                }

                Data data = MainViewmodel.ActiveData;
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

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<TimepointVm> timepoints = vm.Timepoints;
            if (timepoints == null)
            {
                return;
            }

            foreach (TimepointVm t in timepoints)
            {
                if (t.Date >= Start && t.Date <= End)
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

            //Insert reset item
            filteredTimepoints.Insert(0, TimepointVm.INVALID);
        }
        #endregion

        public ParticipationVm() : base()
        {

        }

        public ParticipationVm(T participation) : base(participation)
        {

        }
    }

    public class MembershipVm : ParticipationVm<Membership>
    {
        public MembershipVm() : base()
        {

        }

        public MembershipVm(Membership membership) : base(membership)
        {

        }
    }

    public class ActivityVm : ParticipationVm<Activity>
    {
        public int Role
        {
            get { return model.Role; }
            set
            {
                if (model.Role != value)
                {
                    model.Role = value;
                    NotifyPropertyChanged();
                }
            }
        }

        #region INotifyPropertyChanged w Filters Hack
        private new void NotifyPropertyChanged([CallerMemberName] string propertyName = "")
        {
            if (propertyName == "Groups")
            {
                NotifyPropertyChanged("FilteredRoles");
            }
            //Not needed because its called on ourselve, not on our base class
            /*else if (propertyName == "Roles")
            {
                NotifyPropertyChanged("FilteredGroups");
            }*/

            base.NotifyPropertyChanged(propertyName);
        }
        #endregion

        #region FilteredGroups & FilteredRoles
        protected override void UpdateFilteredGroups()
        {
            if (filteredGroups == null)
            {
                filteredGroups = new ObservableCollection<GroupVm>();
            }

            filteredGroups.Clear();

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<GroupVm> groups = vm.Groups;
            if (groups == null)
            {
                return;
            }

            GroupType_Type groupTypeFilter = GroupType_Type.None;
            if (model.Role != StammbaumDerVaganten.Role.ID_INVALID)
            {
                Data data = MainViewmodel.ActiveData;
                if (data != null)
                {
                    Role r = data.GetRoleByID(model.Role);
                    if (r != null)
                    {
                        groupTypeFilter = r.GroupType;
                    }
                }
            }

            foreach (GroupVm g in groups)
            {
                if (groupTypeFilter == GroupType_Type.None
                    || g.Type == groupTypeFilter
                    || g.ID == model.Group)
                {
                    filteredGroups.Add(g);
                }
            }
        }

        protected ObservableCollection<RoleVm> filteredRoles;

        public ObservableCollection<RoleVm> FilteredRoles
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
                filteredRoles = new ObservableCollection<RoleVm>();
            }

            filteredRoles.Clear();

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm == null)
            {
                return;
            }

            ObservableCollection<RoleVm> roles = vm.Roles;
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

            foreach (RoleVm r in roles)
            {
                /*if (groupTypeFilter == GroupType_Type.None || r.GroupType == groupTypeFilter)
                {*/
                filteredRoles.Add(r);
                //}
            }
        }
        #endregion

        public ActivityVm() : base()
        {

        }

        public ActivityVm(Activity activity) : base(activity)
        {

        }
    }
}
