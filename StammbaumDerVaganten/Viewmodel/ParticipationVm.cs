using System;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;

namespace StammbaumDerVaganten
{

    public class ParticipationVm<T> : ViewmodelOfReferenceable<T>
        where T : Participation<T>, new()
    {
        protected TimespanVm timespanVm;
        public TimespanVm Timespan
        {
            get { return timespanVm; }
            set
            {
                if (timespanVm != value)
                {
                    timespanVm = value;
                    model.Timespan = timespanVm.Model;
                    NotifyPropertyChanged();
                }
            }
        }

        public GroupVm Group
        {
            get { return MainViewmodel.ActiveVm.GetSharedGroupVm(model.GroupRef.Latest); }
            set
            {
                if (MainViewmodel.ActiveVm.GetSharedGroupVm(model.GroupRef.Latest) != value)
                {
                    Debug.Assert(MainViewmodel.ActiveVm.GetSharedGroupVm(model.GroupRef.Latest).Model == model.GroupRef);

                    model.GroupRef.Latest = value.Model.Reference;
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
            if (filteredGroups is null)
            {
                filteredGroups = new ObservableCollection<GroupVm>();
            }

            filteredGroups.Clear();

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm is null)
            {
                return;
            }

            ObservableCollection<GroupVm> groups = vm.Groups;
            if (groups is null)
            {
                return;
            }

            foreach (GroupVm g in groups)
            {
                if (g.MainPhase.Type != GroupType.None)
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
                if (groups[i].MainPhase.Timespan.Start.Year <= groups[newIdx].MainPhase.Timespan.Start.Year)
                {
                    continue;
                }
                while (newIdx > 0 && groups[i].MainPhase.Timespan.Start.Year > groups[newIdx - 1].MainPhase.Timespan.Start.Year)
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
                if (filteredTimepoints is null)
                {
                    filteredTimepoints = new ObservableCollection<TimepointVm>();
                }

                Data data = MainViewmodel.ActiveData;
                if (data is not null && (data.Timepoints.Count + 1) != filteredTimepoints.Count)
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
            if (vm is null)
            {
                return;
            }

            ObservableCollection<TimepointVm> timepoints = vm.Timepoints;
            if (timepoints is null)
            {
                return;
            }

            foreach (TimepointVm t in timepoints)
            {
                if (t.Date >= Timespan.Start && t.Date <= Timespan.End)
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

        public ParticipationVm()
        { }

        public ParticipationVm(T participation)
            : base(participation)
        {
            timespanVm = new TimespanVm(participation.Timespan);
        }
    }

    public class MembershipVm : ParticipationVm<Membership>
    {
        public MembershipVm()
            : base()
        { }

        public MembershipVm(Membership membership)
            : base(membership)
        { }
    }

    public class ActivityVm : ParticipationVm<Activity>
    {
        public int Role
        {
            get { return model.RoleRef.Latest.ObjectID; }
            set
            {
                if (model.RoleRef.Latest.ObjectID != value)
                {
                    model.RoleRef.Latest.ObjectID = value;
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
            if (filteredGroups is null)
            {
                filteredGroups = new ObservableCollection<GroupVm>();
            }

            filteredGroups.Clear();

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm is null)
            {
                return;
            }

            ObservableCollection<GroupVm> groups = vm.Groups;
            if (groups is null)
            {
                return;
            }

            GroupType groupTypeFilter = GroupType.None;
            if (model.RoleRef.Latest.IsValid())
            {
                Data data = MainViewmodel.ActiveData;
                if (data is not null)
                {
                    Role r = data.GetObjectFromReference(model.RoleRef);
                    if (r is not null)
                    {
                        groupTypeFilter = r.GroupType;
                    }
                }
            }

            foreach (GroupVm g in groups)
            {
                Func<GroupType, bool> hasType = new Func<GroupType, bool>((GroupType type) => {
                    if (g.MainPhase.Type == type)
                    {
                        return true;
                    }

                    foreach (GroupPhaseVm gp in g.AdditionalPhases)
                    {
                        if (gp.Type == groupTypeFilter)
                        {
                            return true;
                        }
                    }
                    
                    return false;
                });
                
                if (groupTypeFilter == GroupType.None
                    || hasType(groupTypeFilter)
                    || g.Model.Reference == model.GroupRef.Latest)
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
            if (filteredRoles is null)
            {
                filteredRoles = new ObservableCollection<RoleVm>();
            }

            filteredRoles.Clear();

            MainViewmodel vm = MainViewmodel.ActiveVm;
            if (vm is null)
            {
                return;
            }

            ObservableCollection<RoleVm> roles = vm.Roles;
            if (roles is null)
            {
                return;
            }

            /*GroupType_Type groupTypeFilter = GroupType_Type.None;
            if (group != ID_INVALID)
            {
                Data data = MainViewModel.ActiveData;
                if (data is not null)
                {
                    Group g = data.GetGroupByID(group);
                    if (g is not null)
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

        public ActivityVm()
        { }

        public ActivityVm(Activity activity)
            : base(activity)
        { }
    }
}
